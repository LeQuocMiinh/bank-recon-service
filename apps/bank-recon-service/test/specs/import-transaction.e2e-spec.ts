import request from 'supertest';
import FormData from 'form-data';
import { portgressDb } from '../../src/stores/db';
import { importTransactions } from '../../src/modules/transaction/transaction.controller';
import { Hono } from 'hono';
import { register } from './list-transaction.e2e-spec';
import dotenv from 'dotenv';
dotenv.config();

let app: any;
const PORT = 3001;
const baseUrl = `http://localhost:${PORT}`;

async function setupTestApp() {
  const app = new Hono();
  app.post('/import', importTransactions);

  return { app };
}

beforeAll(async () => {
  const setup = await setupTestApp();
  app = setup.app;
});

afterAll(async () => {
});

describe('Import Transaction', () => {
    let token: string;

  beforeAll(async () => {
        token =  await register('mistake@gmail.com', '123456');
  });
  
  afterAll(async () => {
    const user = await portgressDb.user.findFirst({
      where: { email: "mistake@gmail.com" },
    });

    if (user) {
      await portgressDb.user.delete({
        where: { id: user.id },
      });
    }
  });

  it('should return 400 if no file uploaded', async () => {
    const res = await request(baseUrl)
      .post('/transaction/import').set('Authorization', `Bearer ${token}`);;
    expect(res.status).toBe(400);
  });

  it('should skip invalid rows in CSV', async () => {
    const csv = `date,content,amount,type
21/03/2020 10:20:11,Valid,+100.000,Deposit
,Missing date,+50.000,Deposit
20/03/2020 20:20:11,Valid,-50.000,Withdraw`.trim();

    const form = new FormData();
    form.append('file', Buffer.from(csv), { filename: 'test.csv', contentType: 'text/csv' });

    const res = await request(baseUrl)
      .post('/transaction/import').set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(csv), 'test.csv');

    expect(res.body.total).toBe(2);
  });

});
