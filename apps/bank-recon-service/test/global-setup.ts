import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import bankReconRouter from '../src/routers/route';
import { createRedisService } from '../src/stores';

let server: any;
const PORT = 3001;

export default async function globalSetup() {
  console.log('🟢 Global setup started');

  const app = new Hono();
    app.route('/', bankReconRouter);
    
  createRedisService(process.env.REDIS_URL!);

  server = serve({
    fetch: app.fetch,
    port: PORT,
  });

  (globalThis as any).TEST_SERVER = server;
  (globalThis as any).TEST_PORT = PORT;

  console.log(`🚀 Test server running at http://localhost:${PORT}`);
}
