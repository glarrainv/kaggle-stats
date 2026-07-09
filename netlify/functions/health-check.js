import axios from 'axios';

// Netlify Scheduled Function — replaces the node-cron weekly ping from api/server.js,
// which can't run here since functions don't stay alive between invocations.
// Requires LIVE_URL, LIVE_CHECK, ERROR_CHECK set as Netlify site environment variables.
export default async () => {
  const { LIVE_URL, LIVE_CHECK, ERROR_CHECK } = process.env;

  if (!LIVE_URL) {
    console.log('LIVE_URL not set — skipping health check');
    return new Response('skipped', { status: 200 });
  }

  try {
    const response = await axios.post(LIVE_URL, LIVE_CHECK);
    console.log('Weekly request sent:', response.status);
  } catch (error) {
    console.error('Error sending request:', error.message);
    try {
      const response = await axios.post(LIVE_URL, ERROR_CHECK);
      console.error('Error notification sent with status:', response.status);
    } catch (innerError) {
      console.error('Failed to send error notification:', innerError.message);
    }
  }

  return new Response('ok', { status: 200 });
};

export const config = { schedule: '0 0 * * 0' };
