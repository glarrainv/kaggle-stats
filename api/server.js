import express from 'express';
import { buildSVG, CARD_TYPES } from '../scripts/render.js';
import { fetchKaggleProfile } from '../scripts/fetch.js';
import axios from 'axios';
import nodeCron from 'node-cron';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
dotenv.config();

// ── app ──────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;
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

// GET /card/:type/:username/:slug
app.get('/card/:type/:username/:slug', async (req, res) => {
  try {
  const {type, username, slug } = req.params;
  const theme = req.query.theme || 'kaggle'; // TODO

  if (!Object.keys(CARD_TYPES).includes(type)) { return res.status(400).json({ error: 'Card type not allowed. available options:' + Object.keys(CARD_TYPES) }); }
  

  const typeConfig = Object.values(CARD_TYPES);

  const RelevantData = await fetchKaggleProfile(username, true, type, slug); // args: username, api mode, type[apimode], slug[apimode]
  console.log("RelevantData:", RelevantData);
  if (!RelevantData) {
    return res.status(404).json({ error: `No data found for user "${username}"` });
  }

  // Find the matching item in latest snapshot
  const item = RelevantData.find((d) => d[type] === slug);
  const config = typeConfig.find((d) => d['filterKey'] === type);
  if (!item) {
    return res.status(404).json({ error: `Slug "${slug}" not found in ${type}. JSON: ${JSON.stringify(RelevantData)}` });
  }
  console.log(config)
  const svg = buildSVG(item, config);

  console.log(`Generated SVG for ${username} - ${type} - ${slug}`);
  res
    .setHeader('Content-Type', 'image/svg+xml')
    .setHeader('Cache-Control', 'public, max-age=3600')
    .send(svg);
} catch (error) {
  console.error('Error generating card. check slug matches an item owned by the user:', error);
  res.status(500).json({ error: 'Internal server error' });
};
});

// ── start ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'local') {
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
} else {
const response = await axios.post(LIVE_URL, LIVE_CHECKS);
console.log('Initial request sent:', response.status);
}
export default serverless(app);