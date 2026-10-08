require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const app = require('./src/app');
const connectDB = require('./src/config/db');

const port = Number(process.env.PORT) || 5000;
let server;

async function start() {
  await connectDB();
  server = app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

async function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await require('mongoose').disconnect();
  process.exit(0);
}

if (require.main === module) {
  start().catch((error) => { console.error('Startup failed:', error.message); process.exit(1); });
  ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));
}

module.exports = { start };
