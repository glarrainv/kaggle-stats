import app from './app.js';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import nodeCron from 'node-cron';
import dotenv from 'dotenv';
dotenv.config();

// Local/VPS entry: health-check cron, static frontend, page routes, listen.
// Serverless deploys use netlify/functions/api.js instead.
const PORT = process.env.PORT || 3000;
const Node_ENV = process.env.NODE_ENV || 'local';
const LIVE_URL = process.env.LIVE_URL;
const LIVE_CHECKS = process.env.LIVE_CHECK;
const ERROR_CHECK = process.env.ERROR_CHECK;

if (LIVE_URL) {
  nodeCron.schedule('0 0 * * 0', async () => {
    try {
      const response = await axios.post(LIVE_URL, LIVE_CHECKS);
      console.log('Weekly request sent:', response.status);
    } catch (error) {
      const response = await axios.post(LIVE_URL, ERROR_CHECK);
      console.error('Error sending request:', error.message, 'Error notification sent with status:', response.status);
    }
  });
}

// Static frontend + badge page rewrites (mirrors netlify.toml redirects)
const publicDir = fileURLToPath(new URL('../public', import.meta.url));
app.use(express.static(publicDir));
app.get(['/card/:itemType/:username/:slug', '/badge/:itemType/:username/:slug'],
  (req, res) => res.sendFile(path.join(publicDir, 'item.html')));

// ── start ────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  if (Node_ENV === 'API') {
      const response = await axios.post(LIVE_URL, LIVE_CHECKS);
      console.log('Initial request sent:', response.status);
  }
  console.log(`Badge API running on port ${PORT}`);
});
