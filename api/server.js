import app from './app.js';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodeCron from 'node-cron';
import dotenv from 'dotenv';
dotenv.config();
import { pingHealthcheck } from '../scripts/healthcheck.js';

// Local/VPS entry: health-check cron, static frontend, page routes, listen.
// Serverless deploys use netlify/functions/api.js instead.
const PORT = process.env.PORT || 3000;
const Node_ENV = process.env.NODE_ENV || 'local';

if (process.env.LIVE_URL) {
  nodeCron.schedule('0 0 * * 0', () => pingHealthcheck());
}

// Static frontend + badge page rewrites (mirrors netlify.toml redirects)
const publicDir = fileURLToPath(new URL('../public', import.meta.url));
app.use(express.static(publicDir));
app.get(['/card/:itemType/:username/:slug', '/badge/:itemType/:username/:slug'],
  (req, res) => res.sendFile(path.join(publicDir, 'item.html')));

// ── start ────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  if (Node_ENV === 'API') {
    await pingHealthcheck();
  }
  console.log(`Badge API running on port ${PORT}`);
});
