import { buildSVG } from '../scripts/CardRender.js';
import { Badge } from '../scripts/BadgeRender.js';
import { CARD_CONFIG } from '../scripts/types.js';
import { fetchKaggleProfile } from '../scripts/fetch.js';

import express from 'express';
import { rateLimit } from 'express-rate-limit';

// Shared Express app: used by api/server.js (local) and netlify/functions/api.js (serverless).
// No listen, no cron, no dotenv here.
const app = express();
app.set('trust proxy', 1);

// serverless-http's translated req never populates req.ip, and draft-8 headers hash the
// key unconditionally — an undefined key crashes that hash, so fall back explicitly.
const keyGenerator = (req) =>
  req.ip || req.headers['x-nf-client-connection-ip'] || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator,
  message: { error: 'Too many requests, please slow down and try again in a minute.' },
});

app.use('/api', apiLimiter);

async function renderSVG(req, res) {
  try {
  const {SVGtype, itemType, username, slug } = req.params;
  const theme = req.query.theme || 'kaggle'; // TODO

  console.log(SVGtype, itemType, username, slug);
  if (!Object.keys(CARD_CONFIG).includes(itemType)) { return res.status(400).json({ error: 'Item Type not allowed. available options:' + Object.keys(CARD_CONFIG) }); }


  const RelevantData = await fetchKaggleProfile(username, true, itemType, slug); // args: username, api mode, ItemType[apimode], slug[apimode]

  // User 404 handling
  if (!RelevantData) { return res.status(404).json({ error: `No data found for user "${username}"` });}

  // Find the matching item in latest snapshot
  const item = RelevantData.find((d) => d[itemType] === slug);
  const itemConfig = CARD_CONFIG[itemType];


  // Items 404 handling
  if (!item) { return res.status(404).json({ error: `Slug "${slug}" not found in ${itemType}. JSON: ${JSON.stringify(RelevantData)}` }); }

  if (SVGtype === 'badge') {
    const badge = Badge(username,item,itemType);
    return res
      .setHeader('Content-Type', 'image/svg+xml')
      .setHeader('Cache-Control', 'public, max-age=3600')
      .send(badge);
  }
  else if (SVGtype == "card") {
    const card = buildSVG(item, itemConfig, username, itemType);
    return res
      .setHeader('Content-Type', 'image/svg+xml')
      .setHeader('Cache-Control', 'public, max-age=3600')
      .send(card);
  }

  else {
    return res.status(400).json({ error: `SVG type "${SVGtype}" not supported. Use "badge" or "card".` });
  }
} catch (error) {
  res.status(500).json({ error: 'Error generating card. check slug matches an item owned by the user' });
};
}

async function dataHandler(req, res) {
  try {
    const { itemType, username, slug } = req.params;

    if (!Object.keys(CARD_CONFIG).includes(itemType)) { return res.status(400).json({ error: 'Item Type not allowed. available options:' + Object.keys(CARD_CONFIG) }); }

    const RelevantData = await fetchKaggleProfile(username, true, itemType, slug);

    if (!RelevantData) { return res.status(404).json({ error: `No data found for user "${username}"` }); }

    const item = RelevantData.find((d) => d[itemType] === slug);

    if (!item) { return res.status(404).json({ error: `Slug "${slug}" not found in ${itemType}` }); }

    return res
      .setHeader('Cache-Control', 'public, max-age=3600')
      .json({ username, itemType, slug, item });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching item data. check slug matches an item owned by the user' });
  }
}

// Registration order matters: the literal 'data' segment must win over :SVGtype
app.get('/api/data/:itemType/:username/:slug', dataHandler);
app.get('/api/:SVGtype/:itemType/:username/:slug', renderSVG);
// /svg export alias for badge pages; limiter applied explicitly
app.get('/:SVGtype/:itemType/:username/:slug/svg', apiLimiter, renderSVG);

export default app;
