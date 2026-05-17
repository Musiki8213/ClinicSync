import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { ensureDemoAdmin, ensureDemoDoctors } from './bootstrapDemo.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET in environment. Set it in backend/.env');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment. Set it in backend/.env');
    process.exit(1);
  }
  await connectDB();
  await ensureDemoAdmin();
  await ensureDemoDoctors();
  app.listen(PORT, () => {
    console.log(`ClinicSync API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
