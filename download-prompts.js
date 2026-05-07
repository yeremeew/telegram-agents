#!/usr/bin/env node
/**
 * Downloads agent system prompts from the agency-agents GitHub repo.
 * Run: node download-prompts.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const agents = require('./agents.json');
const PROMPTS_DIR = path.join(__dirname, 'prompts');

if (!fs.existsSync(PROMPTS_DIR)) fs.mkdirSync(PROMPTS_DIR);

const BASE_URL = 'https://raw.githubusercontent.com/msitarzewski/agency-agents/main';

// Map slug → folder/filename in the repo
const SLUG_TO_PATH = {
  // Engineering
  'engineering-frontend-developer':    'engineering/engineering-frontend-developer.md',
  'engineering-backend-architect':     'engineering/engineering-backend-architect.md',
  'engineering-ai-engineer':           'engineering/engineering-ai-engineer.md',
  'engineering-devops-automator':      'engineering/engineering-devops-automator.md',
  'engineering-security-engineer':     'engineering/engineering-security-engineer.md',
  'engineering-mobile-app-builder':    'engineering/engineering-mobile-app-builder.md',
  'engineering-software-architect':    'engineering/engineering-software-architect.md',
  'engineering-senior-developer':      'engineering/engineering-senior-developer.md',
  'engineering-data-engineer':         'engineering/engineering-data-engineer.md',
  'engineering-code-reviewer':         'engineering/engineering-code-reviewer.md',
  'engineering-rapid-prototyper':      'engineering/engineering-rapid-prototyper.md',
  'engineering-technical-writer':      'engineering/engineering-technical-writer.md',
  'engineering-database-optimizer':    'engineering/engineering-database-optimizer.md',
  'engineering-sre':                   'engineering/engineering-sre.md',
  // Marketing
  'marketing-content-creator':         'marketing/marketing-content-creator.md',
  'marketing-seo-specialist':          'marketing/marketing-seo-specialist.md',
  'marketing-social-media-strategist': 'marketing/marketing-social-media-strategist.md',
  'marketing-growth-hacker':           'marketing/marketing-growth-hacker.md',
  'marketing-linkedin-content-creator':'marketing/marketing-linkedin-content-creator.md',
  'marketing-tiktok-strategist':       'marketing/marketing-tiktok-strategist.md',
  'marketing-instagram-curator':       'marketing/marketing-instagram-curator.md',
  'marketing-podcast-strategist':      'marketing/marketing-podcast-strategist.md',
  'marketing-twitter-engager':         'marketing/marketing-twitter-engager.md',
  'marketing-email-intelligence-engineer':'marketing/marketing-email-intelligence-engineer.md',
  'marketing-book-co-author':          'marketing/marketing-book-co-author.md',
  // Sales
  'sales-coach':                       'sales/sales-coach.md',
  'sales-deal-strategist':             'sales/sales-deal-strategist.md',
  'sales-account-strategist':          'sales/sales-account-strategist.md',
  'sales-outbound-strategist':         'sales/sales-outbound-strategist.md',
  'sales-engineer':                    'sales/sales-engineer.md',
  'sales-proposal-strategist':         'sales/sales-proposal-strategist.md',
  'sales-discovery-coach':             'sales/sales-discovery-coach.md',
  'sales-pipeline-analyst':            'sales/sales-pipeline-analyst.md',
  // Design
  'design-ux-architect':               'design/design-ux-architect.md',
  'design-ui-designer':                'design/design-ui-designer.md',
  'design-brand-guardian':             'design/design-brand-guardian.md',
  'design-visual-storyteller':         'design/design-visual-storyteller.md',
  'design-ux-researcher':              'design/design-ux-researcher.md',
  'design-image-prompt-engineer':      'design/design-image-prompt-engineer.md',
  // Product
  'product-manager':                   'product/product-manager.md',
  'product-sprint-prioritizer':        'product/product-sprint-prioritizer.md',
  'product-trend-researcher':          'product/product-trend-researcher.md',
  'product-feedback-synthesizer':      'product/product-feedback-synthesizer.md',
  'product-behavioral-nudge-engine':   'product/product-behavioral-nudge-engine.md',
  // Finance
  'finance-financial-analyst':         'finance/finance-financial-analyst.md',
  'finance-bookkeeper-controller':     'finance/finance-bookkeeper-controller.md',
  'finance-fpa-analyst':               'finance/finance-fpa-analyst.md',
  'finance-investment-researcher':     'finance/finance-investment-researcher.md',
  'finance-tax-strategist':            'finance/finance-tax-strategist.md',
};

function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchFile(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading agent prompts from GitHub...\n');
  let ok = 0, fail = 0;

  for (const agent of agents) {
    const repoPath = SLUG_TO_PATH[agent.slug];
    if (!repoPath) {
      console.log(`⚠️  No repo path for ${agent.slug}`);
      fail++;
      continue;
    }

    const url = `${BASE_URL}/${repoPath}`;
    const destFile = path.join(PROMPTS_DIR, `${agent.slug}.md`);

    // Skip if already downloaded
    if (fs.existsSync(destFile)) {
      console.log(`✓ Already have ${agent.slug}`);
      ok++;
      continue;
    }

    try {
      const { status, body } = await fetchFile(url);
      if (status === 200 && body.length > 100) {
        fs.writeFileSync(destFile, body);
        console.log(`✓ ${agent.name} (${agent.title})`);
        ok++;
      } else {
        console.log(`✗ ${agent.slug} — HTTP ${status}`);
        fail++;
      }
    } catch (e) {
      console.log(`✗ ${agent.slug} — ${e.message}`);
      fail++;
    }

    await new Promise(r => setTimeout(r, 150)); // gentle rate limit
  }

  console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
}

main();
