# Telegram Agents

50 specialized AI agents available as individual Telegram contacts, powered by Claude.

## Quick Start

### 1. Create bots in Telegram
Open `BOTFATHER_SETUP.md` — it has every agent's display name, username, and which token env var to fill in.

Create as many or as few as you want. Start with 5-10 and add more later.

### 2. Configure
```bash
cp .env.example .env
# Fill in ANTHROPIC_API_KEY, WEBHOOK_BASE_URL, and bot tokens
```

### 3. Install & download agent personalities
```bash
npm install
node download-prompts.js
```

### 4. Deploy to Railway (recommended — free tier works)

1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Add all your env vars from `.env`
4. Railway gives you a URL like `https://telegram-agents.up.railway.app`
5. Set `WEBHOOK_BASE_URL=https://telegram-agents.up.railway.app` in Railway env vars
6. Deploy — webhooks register automatically on startup

### 5. Start chatting
Open Telegram → find your bot (e.g. @AlexChenDevBot) → `/start` → send any message.

---

## Commands available in every chat

| Command | What it does |
|---|---|
| `/start` | Introduction from the agent |
| `/who` | Remind yourself who this agent is |
| `/clear` | Clear conversation history (fresh start) |

---

## Adding more agents later

1. Add the agent to `agents.json`
2. Add the repo path to `download-prompts.js`
3. Add the token env key to `.env.example` and your `.env`
4. Create the bot via BotFather
5. Redeploy

---

## Architecture

- **Single Express server** handles webhooks for all bots
- **SQLite** stores conversation history per `chat_id` + `bot_slug`
- **Claude Sonnet** powers every agent with their specific system prompt
- **Telegraf** handles Telegram Bot API
- Each bot registers its own webhook at `/webhook/{agent-slug}`
