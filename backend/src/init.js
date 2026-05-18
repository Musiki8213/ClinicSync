import { connectDB } from './config/db.js';
import { ensureDemoAdmin, ensureDemoDoctors, ensureDemoPatients } from './bootstrapDemo.js';

let ready;

export function initApp() {
  if (!ready) {
    ready = (async () => {
      if (!process.env.JWT_SECRET) {
        throw new Error('Missing JWT_SECRET in environment');
      }
      if (!process.env.MONGODB_URI) {
        throw new Error('Missing MONGODB_URI in environment');
      }
      await connectDB();
      await ensureDemoAdmin();
      await ensureDemoDoctors();
      await ensureDemoPatients();
    })();
  }
  return ready;
}
