import request from 'supertest';
import FormData from 'form-data';
import { createPrismaTestClient } from '../utils/prisma-test-client';
import { portgressDb } from '../../src/stores/db';
import { importTransactions } from '../../src/modules/transaction/transaction.controller';
import { Hono } from 'hono';

let app: any;
let prisma: any;
const PORT = 3001;
const baseUrl = `http://localhost:${PORT}`;

async function setupTestApp() {
  portgressDb.$disconnect().catch(()=>{});
  const prisma = createPrismaTestClient();
  (portgressDb as any) = prisma; 

  const app = new Hono();
  app.post('/import', importTransactions);

  return { app, prisma };
}

async function loginAndGetToken(email: string, password: string) {
  const res = await request(baseUrl)
    .post('/auth/login')
    .send({ email, password })
    .set('Accept', 'application/json');
  return res.body.token;
}

beforeAll(async () => {
  const setup = await setupTestApp();
  app = setup.app;
  prisma = setup.prisma;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Import Transaction', () => {
    let token: string;

    beforeAll(async () => {
        token = await loginAndGetToken('minh@gmail.com', '123456');
    });

  it('should return 400 if no file uploaded', async () => {
    const res = await request(baseUrl)
      .post('/transaction/import').set('Authorization', `Bearer ${token}`);;
    expect(res.status).toBe(400);
  });

  it('should import all valid transactions from CSV', async () => {
    const csv = `date,content,amount,type
21/03/2020 10:20:11,Deposit,+100.000,Deposit
20/03/2020 20:20:11,Withdraw,-50.000,Withdraw`.trim();

    const form = new FormData();
    form.append('file', Buffer.from(csv), { filename: 'test.csv', contentType: 'text/csv' });

    const res = await request(baseUrl)
      .post('/transaction/import').set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(csv), 'test.csv');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
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

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });

});
