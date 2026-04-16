import { buildSVG } from '../scripts/CardRender.js';
import { Badge } from '../scripts/BadgeRender.js';
import { CARD_CONFIG, MEDAL_COLORS } from '../scripts/types.js';
import { fetchKaggleProfile } from '../scripts/fetch.js';

import express from 'express';
import axios from 'axios';
import nodeCron from 'node-cron';
import dotenv from 'dotenv';
dotenv.config();

// Constant variables and express config
const app  = express();
const PORT = process.env.PORT || 3000;
const Node_ENV = process.env.NODE_ENV || 'local';
const LIVE_URL = process.env.LIVE_URL;
const LIVE_CHECKS = process.env.LIVE_CHECK;
const ERROR_CHECK = process.env.ERROR_CHECK;

nodeCron.schedule('0 0 * * 0', async () => {
  try {
    const response = await axios.post(LIVE_URL, LIVE_CHECKS);
    console.log('Weekly request sent:', response.status);
  } catch (error) {
    const response = await axios.post(LIVE_URL, ERROR_CHECK);
    console.error('Error sending request:', error.message, 'Error notification sent with status:', response.status);
  }
});

app.get('/api/:SVGtype/:itemType/:username/:slug', async (req, res) => {
  try {
  const {SVGtype, itemType, username, slug } = req.params;
  const theme = req.query.theme || 'kaggle'; // TODO

  console.log(SVGtype, itemType, username, slug);
  if (!Object.keys(CARD_CONFIG).includes(itemType)) { return res.status(400).json({ error: 'Item Type not allowed. available options:' + Object.keys(CARD_CONFIG) }); }
  

  const RelevantData = await fetchKaggleProfile(username, true, itemType, slug); // args: username, api mode, ItemType[apimode], slug[apimode]
  console.log("RelevantData:", RelevantData);

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
    const card = buildSVG(item, itemConfig, username);
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
});

// ── start ────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  if (Node_ENV === 'API') {
      const response = await axios.post(LIVE_URL, LIVE_CHECKS);
      console.log('Initial request sent:', response.status);
  }
  console.log(`Badge API running on port ${PORT}`);
});