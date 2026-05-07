require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const Anthropic = require('@anthropic-ai/sdk');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', bots: botsStarted });
});

app.post('/test', (req, res) => {
  res.json({ received: req.body });
});

app.listen(PORT, () => {
  console.log(`\nTelegram Agents running on port ${PORT}`);
  console.log(`${botsStarted} bot(s) active\n`);
});
