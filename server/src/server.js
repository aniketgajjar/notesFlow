import mongoose from 'mongoose';
import { createApp } from './app.js';
import { getConfig } from './config/env.js';
import { loadServerEnv } from './config/loadEnv.js';

loadServerEnv();

async function start() {
  const config = getConfig();
  await mongoose.connect(config.MONGODB_URI);
  const app = createApp();
  const server = app.listen(config.PORT, () => {
    console.info(`NotesFlow API listening on port ${config.PORT}`);
  });

  const shutdown = async (signal) => {
    console.info(`${signal} received; closing NotesFlow API`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error(`Unable to start NotesFlow API: ${error.message}`);
  process.exitCode = 1;
});
