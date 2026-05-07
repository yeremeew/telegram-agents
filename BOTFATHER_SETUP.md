# BotFather Setup Guide

Open Telegram → search **@BotFather** → start a chat.

For each agent below, run these commands in BotFather:

1. `/newbot`
2. Enter the **Display Name** (how it appears in chat)
3. Enter the **Username** (must end in `bot`, must be unique on Telegram)
4. Copy the token → paste into your `.env` file

Then set the profile picture and description:
- `/setdescription` → paste the Description
- `/setuserpic` → upload a photo (optional)

---

## Engineering

| Display Name | Username | Token Env Key | Description |
|---|---|---|---|
| Alex Chen | `AlexChenDevBot` | `BOT_TOKEN_ENGINEERING_FRONTEND_DEVELOPER` | Frontend Developer. React, performance, UI engineering. |
| Marcus Webb | `MarcusWebbBot` | `BOT_TOKEN_ENGINEERING_BACKEND_ARCHITECT` | Backend Architect. APIs, microservices, databases, scale. |
| Priya Sharma | `PriyaSharmaAIBot` | `BOT_TOKEN_ENGINEERING_AI_ENGINEER` | AI/ML Engineer. Models, pipelines, LLM integrations. |
| Jordan Kim | `JordanKimDevOpsBot` | `BOT_TOKEN_ENGINEERING_DEVOPS_AUTOMATOR` | DevOps Automator. CI/CD, infra, deployment, monitoring. |
| Sam Rivera | `SamRiveraSecBot` | `BOT_TOKEN_ENGINEERING_SECURITY_ENGINEER` | Security Engineer. Threat modeling, code review, OWASP. |
| Chris Park | `ChrisParkMobileBot` | `BOT_TOKEN_ENGINEERING_MOBILE_APP_BUILDER` | Mobile App Builder. iOS, Android, React Native, Flutter. |
| Taylor Brooks | `TaylorBrooksArchBot` | `BOT_TOKEN_ENGINEERING_SOFTWARE_ARCHITECT` | Software Architect. System design, patterns, scalability. |
| Morgan Lee | `MorganLeeSeniorBot` | `BOT_TOKEN_ENGINEERING_SENIOR_DEVELOPER` | Senior Developer. Code quality, mentoring, best practices. |
| Casey Wang | `CaseyWangDataBot` | `BOT_TOKEN_ENGINEERING_DATA_ENGINEER` | Data Engineer. Pipelines, ETL, warehouses, analytics. |
| Riley Johnson | `RileyJohnsonReviewBot` | `BOT_TOKEN_ENGINEERING_CODE_REVIEWER` | Code Reviewer. PR reviews, refactoring, quality gates. |
| Quinn Torres | `QuinnTorresProtoBot` | `BOT_TOKEN_ENGINEERING_RAPID_PROTOTYPER` | Rapid Prototyper. Fast MVPs, proof of concepts, demos. |
| Aria Sanchez | `AriaSanchezWriterBot` | `BOT_TOKEN_ENGINEERING_TECHNICAL_WRITER` | Technical Writer. Docs, APIs, guides, changelogs. |
| Drew Mitchell | `DrewMitchellDBBot` | `BOT_TOKEN_ENGINEERING_DATABASE_OPTIMIZER` | Database Optimizer. Query tuning, schema design, indexing. |
| Blake Hayes | `BlakeHayesSREBot` | `BOT_TOKEN_ENGINEERING_SRE` | Site Reliability Engineer. Uptime, incidents, SLOs. |

## Marketing

| Display Name | Username | Token Env Key | Description |
|---|---|---|---|
| Emma Davis | `EmmaDavisContentBot` | `BOT_TOKEN_MARKETING_CONTENT_CREATOR` | Content Creator. Blog, video, social, brand storytelling. |
| Noah Martinez | `NoahMartinezSEOBot` | `BOT_TOKEN_MARKETING_SEO_SPECIALIST` | SEO Specialist. Organic growth, technical SEO, content strategy. |
| Sophia Wilson | `SophiaWilsonSocialBot` | `BOT_TOKEN_MARKETING_SOCIAL_MEDIA_STRATEGIST` | Social Media Strategist. Cross-platform growth and engagement. |
| Liam Thompson | `LiamThompsonGrowthBot` | `BOT_TOKEN_MARKETING_GROWTH_HACKER` | Growth Hacker. Acquisition, retention, viral loops, experiments. |
| Olivia Brown | `OliviaBrownLinkedInBot` | `BOT_TOKEN_MARKETING_LINKEDIN_CONTENT_CREATOR` | LinkedIn Creator. B2B content, thought leadership, personal brand. |
| Ethan Garcia | `EthanGarciaTikTokBot` | `BOT_TOKEN_MARKETING_TIKTOK_STRATEGIST` | TikTok Strategist. Viral content, hooks, trends, creator growth. |
| Ava Rodriguez | `AvaRodriguezIGBot` | `BOT_TOKEN_MARKETING_INSTAGRAM_CURATOR` | Instagram Curator. Visual content, reels, aesthetics, growth. |
| Lucas Anderson | `LucasAndersonPodBot` | `BOT_TOKEN_MARKETING_PODCAST_STRATEGIST` | Podcast Strategist. Show growth, episodes, guest strategy. |
| Mason White | `MasonWhiteTwitterBot` | `BOT_TOKEN_MARKETING_TWITTER_ENGAGER` | Twitter/X Strategist. Threads, engagement, audience building. |
| Zara Collins | `ZaraCollinsEmailBot` | `BOT_TOKEN_MARKETING_EMAIL_INTELLIGENCE_ENGINEER` | Email Marketing. Campaigns, automation, deliverability, copy. |
| River Stone | `RiverStoneBookBot` | `BOT_TOKEN_MARKETING_BOOK_CO_AUTHOR` | Book & Long-Form Writer. Books, white papers, long-form content. |

## Sales

| Display Name | Username | Token Env Key | Description |
|---|---|---|---|
| Zoe Harris | `ZoeHarrisSalesBot` | `BOT_TOKEN_SALES_COACH` | Sales Coach. Pipeline, objections, closing, team performance. |
| Aiden Clark | `AidenClarkDealBot` | `BOT_TOKEN_SALES_DEAL_STRATEGIST` | Deal Strategist. Complex sales, negotiation, multi-stakeholder. |
| Isabella Lewis | `IsabellaLewisAcctBot` | `BOT_TOKEN_SALES_ACCOUNT_STRATEGIST` | Account Strategist. Expansion, retention, QBRs, NRR. |
| Logan Robinson | `LoganRobinsonOutboundBot` | `BOT_TOKEN_SALES_OUTBOUND_STRATEGIST` | Outbound Strategist. Cold outreach, sequences, ICP targeting. |
| Ella Walker | `EllaWalkerSEBot` | `BOT_TOKEN_SALES_ENGINEER` | Sales Engineer. Technical demos, POCs, solution design. |
| James Hall | `JamesHallProposalBot` | `BOT_TOKEN_SALES_PROPOSAL_STRATEGIST` | Proposal Strategist. RFPs, decks, pricing, win themes. |
| Charlotte Young | `CharlotteYoungDiscBot` | `BOT_TOKEN_SALES_DISCOVERY_COACH` | Discovery Coach. Qualification, MEDDIC, pain identification. |
| Benjamin Allen | `BenjaminAllenPipeBot` | `BOT_TOKEN_SALES_PIPELINE_ANALYST` | Pipeline Analyst. Forecasting, funnel health, CRM hygiene. |

## Design

| Display Name | Username | Token Env Key | Description |
|---|---|---|---|
| Amelia King | `AmeliaKingUXBot` | `BOT_TOKEN_DESIGN_UX_ARCHITECT` | UX Architect. User flows, IA, interaction design, systems. |
| Henry Wright | `HenryWrightUIBot` | `BOT_TOKEN_DESIGN_UI_DESIGNER` | UI Designer. Visual design, components, design systems. |
| Evelyn Scott | `EvelynScottBrandBot` | `BOT_TOKEN_DESIGN_BRAND_GUARDIAN` | Brand Guardian. Identity, guidelines, consistency, positioning. |
| Alexander Green | `AlexGreenVisualBot` | `BOT_TOKEN_DESIGN_VISUAL_STORYTELLER` | Visual Storyteller. Narrative design, video concepts, campaigns. |
| Abigail Baker | `AbigailBakerResearchBot` | `BOT_TOKEN_DESIGN_UX_RESEARCHER` | UX Researcher. Usability testing, interviews, insights. |
| Michael Adams | `MichaelAdamsImageBot` | `BOT_TOKEN_DESIGN_IMAGE_PROMPT_ENGINEER` | Image Prompt Engineer. AI image prompts, Midjourney, DALL-E. |

## Product

| Display Name | Username | Token Env Key | Description |
|---|---|---|---|
| Harper Nelson | `HarperNelsonPMBot` | `BOT_TOKEN_PRODUCT_MANAGER` | Product Manager. Roadmaps, PRDs, prioritization, GTM. |
| Daniel Carter | `DanielCarterSprintBot` | `BOT_TOKEN_PRODUCT_SPRINT_PRIORITIZER` | Sprint Prioritizer. Backlog grooming, sprint planning, trade-offs. |
| Sofia Mitchell | `SofiaMitchellTrendBot` | `BOT_TOKEN_PRODUCT_TREND_RESEARCHER` | Trend Researcher. Market signals, competitive intel, opportunities. |
| Joseph Perez | `JosephPerezFeedbackBot` | `BOT_TOKEN_PRODUCT_FEEDBACK_SYNTHESIZER` | Feedback Synthesizer. User research synthesis, insight extraction. |
| Grace Roberts | `GraceRobertsBehaviorBot` | `BOT_TOKEN_PRODUCT_BEHAVIORAL_NUDGE_ENGINE` | Behavioral Designer. Engagement, retention, habit formation. |

## Finance

| Display Name | Username | Token Env Key | Description |
|---|---|---|---|
| Samuel Turner | `SamuelTurnerFinanceBot` | `BOT_TOKEN_FINANCE_FINANCIAL_ANALYST` | Financial Analyst. Modeling, forecasting, valuation, reporting. |
| Victoria Phillips | `VictoriaPhillipsBookBot` | `BOT_TOKEN_FINANCE_BOOKKEEPER_CONTROLLER` | Bookkeeper & Controller. Accounting, close process, controls. |
| David Campbell | `DavidCampbellFPABot` | `BOT_TOKEN_FINANCE_FPA_ANALYST` | FP&A Analyst. Budgets, variance analysis, board reporting. |
| Lily Parker | `LilyParkerInvestBot` | `BOT_TOKEN_FINANCE_INVESTMENT_RESEARCHER` | Investment Researcher. Due diligence, market analysis, thesis. |
| Sebastian Evans | `SebastianEvansTaxBot` | `BOT_TOKEN_FINANCE_TAX_STRATEGIST` | Tax Strategist. Planning, structuring, compliance, optimization. |

---

## After creating all bots

1. Copy `.env.example` → `.env`
2. Fill in all the tokens
3. Run `npm install`
4. Run `node download-prompts.js` (downloads agent personalities from GitHub)
5. Deploy to Railway/Render (see README.md)
6. The service auto-registers all webhooks on startup
