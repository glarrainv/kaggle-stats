import serverless from 'serverless-http';
import app from '../../api/app.js';

const wrapped = serverless(app);
const FN_PREFIX = '/.netlify/functions/api';

export const handler = async (event, context) => {
  if (event.path.startsWith(FN_PREFIX)) {
    event.path = event.path.slice(FN_PREFIX.length) || '/';
  }
  return wrapped(event, context);
};
