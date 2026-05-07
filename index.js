require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const anthropic = new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || '').trim() });
const WEBHOOK_BASE = process.env.WEBHOOK_BASE_URL; // e.g. https://your-server.com
const PORT = process.env.PORT || 3000;

// ── Database ──────────────────────────────────────────────────────────────────
const db = new Database('conversations.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id     TEXT    NOT NULL,
    bot_slug    TEXT    NOT NULL,
    role        TEXT    NOT NULL,
    content     TEXT    NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_chat ON messages(chat_id, bot_slug, created_at);
`);

const insertMsg  = db.prepare('INSERT INTO messages (chat_id, bot_slug, role, content) VALUES (?, ?, ?, ?)');
const getHistory = db.prepare('SELECT role, content FROM messages WHERE chat_id = ? AND bot_slug = ? ORDER BY created_at DESC LIMIT 30');

// ── Agents ────────────────────────────────────────────────────────────────────
const agents = require('./agents.json');
const PROMPTS_DIR = path.join(__dirname, 'prompts');

function loadPrompt(slug, name, title, emoji) {
  const file = path.join(PROMPTS_DIR, `${slug}.md`);
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, 'utf-8');
    return `You are ${name}, a ${title} ${emoji}.\n\n${raw}\n\nImportant: You are chatting via Telegram. Keep responses clear and well-formatted. Use markdown where helpful. Be direct and actionable. Your name is ${name}.`;
  }
  // Fallback prompt if file not downloaded yet
  return `You are ${name}, an expert ${title} ${emoji}.
You are a highly skilled professional with deep expertise in your domain.
Be direct, specific, and actionable. Give concrete recommendations, not vague advice.
Your name is ${name}. You are chatting via Telegram — keep responses focused and well-structured.`;
}

// ── Boot each bot ─────────────────────────────────────────────────────────────
let botsStarted = 0;

for (const agent of agents) {
  const tokenEnvKey = `BOT_TOKEN_${agent.slug.toUpperCase().replace(/-/g, '_')}`;
  const token = (process.env[tokenEnvKey] || '').trim();

  if (!token) continue; // Skip agents without a token configured
  console.log(`Loading ${agent.name} with token: ${token.substring(0, 10)}...`);

  const systemPrompt = loadPrompt(agent.slug, agent.name, agent.title, agent.emoji);
  const bot = new Telegraf(token);
  const webhookPath = `/webhook/${agent.slug}`;

  // /start command
  bot.start(async (ctx) => {
    try {
      await ctx.reply(
        `Hey! I'm *${agent.name}*, your ${agent.emoji} *${agent.title}*.\n\nSend me anything — a task, a question, a problem. I'm here to help.`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error(`[${agent.name}] /start reply error:`, err.message);
    }
  });

  // /clear command — reset conversation history
  bot.command('clear', async (ctx) => {
    const chatId = ctx.chat.id.toString();
    db.prepare('DELETE FROM messages WHERE chat_id = ? AND bot_slug = ?').run(chatId, agent.slug);
    await ctx.reply('Conversation cleared. Fresh start 👍');
  });

  // /who command — remind who this agent is
  bot.command('who', async (ctx) => {
    await ctx.reply(`I'm *${agent.name}* ${agent.emoji} — ${agent.title}.`, { parse_mode: 'Markdown' });
  });

  // Handle all text messages
  bot.on('text', async (ctx) => {
    const chatId  = ctx.chat.id.toString();
    const userMsg = ctx.message.text;

    // Ignore bot commands (already handled above)
    if (userMsg.startsWith('/')) return;

    // Show typing indicator
    await ctx.sendChatAction('typing');

    // Load history (most recent 30, reversed to chronological)
    const history = getHistory.all(chatId, agent.slug).reverse();

    // Build Claude messages
    const messages = [
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMsg },
    ];

    try {
      const response = await anthropic.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 2048,
        system:     systemPrompt,
        messages,
      });

      const reply = response.content[0].text;

      // Persist both sides
      insertMsg.run(chatId, agent.slug, 'user',      userMsg);
      insertMsg.run(chatId, agent.slug, 'assistant', reply);

      // Telegram message limit is 4096 chars — split if needed
      if (reply.length <= 4000) {
        await ctx.reply(reply, { parse_mode: 'Markdown' });
      } else {
        const chunks = reply.match(/.{1,4000}/gs) || [reply];
        for (const chunk of chunks) {
          await ctx.reply(chunk, { parse_mode: 'Markdown' });
        }
      }
    } catch (err) {
      console.error(`[${agent.name}] Claude error:`, err.message);
      await ctx.reply('Sorry, hit a snag. Try again in a moment.');
    }
  });

  // Register webhook route
  app.post(webhookPath, (req, res) => {
    res.sendStatus(200);
    bot.handleUpdate(req.body).catch(err => console.error(`[${agent.name}] update error:`, err));
  });

  // Set webhook on startup
  if (WEBHOOK_BASE) {
    const fullUrl = `${WEBHOOK_BASE}${webhookPath}`;
    bot.telegram.setWebhook(fullUrl)
      .then(() => console.log(`✓ ${agent.name} (${agent.title}) → ${fullUrl}`))
      .catch(e => console.error(`✗ ${agent.name}: ${e.message}`));
  }

  botsStarted++;
}

// ── Team Coordinator Bot ──────────────────────────────────────────────────────
const COORDINATOR_TOKEN = (process.env.BOT_TOKEN_TEAM_COORDINATOR || '').trim();

if (COORDINATOR_TOKEN) {
  const coordinator = new Telegraf(COORDINATOR_TOKEN);

  // Pre-load all agent prompts
  const agentPrompts = {};
  for (const agent of agents) {
    agentPrompts[agent.slug] = loadPrompt(agent.slug, agent.name, agent.title, agent.emoji);
  }

  // Agent roster for routing prompt
  const agentRoster = agents
    .map(a => `${a.slug} | ${a.name} | ${a.title}`)
    .join('\n');

  async function pickAgent(userMsg) {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{
        role: 'user',
        content: `You are a routing assistant. Pick the single best specialist for this message.\n\nTeam roster (slug | name | title):\n${agentRoster}\n\nUser message: "${userMsg}"\n\nReply with ONLY the slug. No explanation.`
      }]
    });
    return res.content[0].text.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  }

  coordinator.start(async (ctx) => {
    await ctx.reply(
      `Hey! I'm your *AI Team Coordinator* 🧠\n\nAsk me anything — I'll route you to the right specialist automatically.\n\nYour team: ${agents.map(a => `${a.emoji} ${a.name}`).join(', ')}`,
      { parse_mode: 'Markdown' }
    );
  });

  coordinator.command('team', async (ctx) => {
    const list = agents.map(a => `${a.emoji} *${a.name}* — ${a.title}`).join('\n');
    await ctx.reply(`*Your team:*\n\n${list}`, { parse_mode: 'Markdown' });
  });

  coordinator.on('text', async (ctx) => {
    const userMsg = ctx.message.text;
    if (userMsg.startsWith('/')) return;

    const chatId = ctx.chat.id.toString();
    await ctx.sendChatAction('typing');

    try {
      // Pick best agent
      const slug = await pickAgent(userMsg);
      const agent = agents.find(a => a.slug === slug) || agents[0];
      const systemPrompt = agentPrompts[agent.slug];

      // Load shared coordinator history
      const history = getHistory.all(chatId, 'coordinator').reverse();
      const messages = [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMsg }
      ];

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        messages
      });

      const reply = response.content[0].text;

      insertMsg.run(chatId, 'coordinator', 'user', userMsg);
      insertMsg.run(chatId, 'coordinator', 'assistant', reply);

      const header = `*${agent.name}* ${agent.emoji}\n\n`;
      const full = header + reply;

      if (full.length <= 4000) {
        await ctx.reply(full, { parse_mode: 'Markdown' });
      } else {
        await ctx.reply(header, { parse_mode: 'Markdown' });
        const chunks = reply.match(/.{1,4000}/gs) || [reply];
        for (const chunk of chunks) {
          await ctx.reply(chunk, { parse_mode: 'Markdown' });
        }
      }
    } catch (err) {
      console.error('[Coordinator] error:', err.message);
      await ctx.reply('Sorry, hit a snag. Try again in a moment.');
    }
  });

  const coordinatorPath = '/webhook/team-coordinator';
  app.post(coordinatorPath, (req, res) => {
    res.sendStatus(200);
    coordinator.handleUpdate(req.body).catch(err => console.error('[Coordinator] update error:', err));
  });

  if (WEBHOOK_BASE) {
    const fullUrl = `${WEBHOOK_BASE}${coordinatorPath}`;
    coordinator.telegram.setWebhook(fullUrl)
      .then(() => console.log(`✓ Team Coordinator → ${fullUrl}`))
      .catch(e => console.error(`✗ Team Coordinator: ${e.message}`));
  }

  botsStarted++;
  console.log('Team Coordinator loaded');
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', bots: botsStarted });
});

app.post('/test', (req, res) => {
  res.json({ received: req.body });
});

app.get('/debug-key', (req, res) => {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  res.json({ length: key.length, starts: key.substring(0, 15), ends: key.slice(-6) });
});

app.get('/test-claude', async (req, res) => {
  try {
    const result = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'say hi' }]
    });
    res.json({ ok: true, text: result.content[0].text });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\nTelegram Agents running on port ${PORT}`);
  console.log(`${botsStarted} bot(s) active\n`);
});
