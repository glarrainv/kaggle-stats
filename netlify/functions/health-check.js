import { pingHealthcheck } from '../../scripts/healthcheck.js';

// Netlify Scheduled Function — weekly Healthchecks.io heartbeat ping.
// Requires LIVE_URL (and optionally LIVE_CHECK/ERROR_CHECK) set as Netlify site environment variables.
export default async () => {
  await pingHealthcheck();
  return new Response('ok', { status: 200 });
};

export const config = { schedule: '0 0 * * 0' };
