import dotenv from 'dotenv';
import app from './app.js';
import { initApp } from './init.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  await initApp();
  app.listen(PORT, () => {
    console.log(`ClinicSync API listening on port ${PORT}`);
  });
}

/** Vercel experimentalServices loads this file and needs a default export. */
export default app;

if (process.env.VERCEL !== '1') {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
