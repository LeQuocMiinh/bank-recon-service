import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createRedisService } from './stores/redis';
import bankReconRouter from './routers/route';
import dotenv from "dotenv";
import { swaggerConfig } from './utils';
import { portgressDb } from './stores/db';
import { rateLimit } from './middlewares';
dotenv.config();

const app = new Hono();
swaggerConfig(app, "swagger");
  
(async () => {
  try {
    createRedisService(process.env.REDIS_URL!);
    
    await portgressDb.$connect();
    
    console.log('Database connected');
    app.use("*", rateLimit);
    app.route("/", bankReconRouter);
    
  } catch (error) {
    console.error(error);
  }

  serve({
    fetch: app.fetch,
    port: 3000,
  });
})();

console.log('🚀 Server is running at http://localhost:3000');
console.log('📗 Swagger running at http://localhost:3000/swagger/ui, document: ["/docs", "/openapi"]');
