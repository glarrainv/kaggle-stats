import axios from 'axios';

// Pings Healthchecks.io: success hits LIVE_URL, failure hits LIVE_URL + '/fail'.
// LIVE_CHECK / ERROR_CHECK are sent as the ping's diagnostic request body.
export async function pingHealthcheck() {
  const { LIVE_URL, LIVE_CHECK, ERROR_CHECK } = process.env;
  if (!LIVE_URL) return;

  const base = LIVE_URL.replace(/\/+$/, '');
  try {
    const response = await axios.post(base, LIVE_CHECK);
    console.log('Healthcheck success ping sent:', response.status);
  } catch (error) {
    console.error('Healthcheck success ping failed:', error.message);
    try {
      const response = await axios.post(`${base}/fail`, ERROR_CHECK);
      console.error('Healthcheck failure ping sent:', response.status);
    } catch (innerError) {
      console.error('Healthcheck failure ping also failed:', innerError.message);
    }
  }
}
