import request from 'supertest';
import { ListTransactionDto } from '../../src/dtos';
import { portgressDb } from '../../src/stores';

const PORT = 3001;
const baseUrl = `http://localhost:${PORT}`;

export async function loginAndGetToken(email: string, password: string) {
  const res = await request(baseUrl)
    .post('/auth/login')
    .send({ email, password })
    .set('Accept', 'application/json');
  return res.body.token;
}

export async function register(email: string, password: string) {
  const res = await request(baseUrl)
    .post('/auth/register')
    .send({ email, password })
    .set('Accept', 'application/json');
  return res.body.token;
}


describe("List Transactions", () => {
   let token: string;

  beforeAll(async () => {
    await register('minh456@gmail.com', '123456');
    token = await loginAndGetToken('minh456@gmail.com', '123456');
  });
  
  afterAll(async () => {
    const user = await portgressDb.user.findFirst({
      where: { email: "minh456@gmail.com" },
    });

    if (user) {
      await portgressDb.user.delete({
        where: { id: user.id },
      });
    }
  });


  it("should return 401 if user is not authenticated", async () => {
    const res = await request(baseUrl)
      .get("/transaction/list")
      .set("Accept", "application/json");

    expect(res.body).toEqual({ error: "Unauthorized", ok: false });
  });
    
    it("should pass validation with valid page and limit", () => {
    const data = { page: 2, limit: 10 };
    const result = ListTransactionDto.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
    });
    
  it("should fail validation when page or limit is less than 1 or invalid", () => {
    const invalidData = { page: 0, limit: -5 };
    const result = ListTransactionDto.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
    
  it("should return paginated transactions for authenticated user", async () => {
    const res = await request(baseUrl)
      .get("/transaction/list?page=1&limit=1")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.transactions).toBeInstanceOf(Array);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(1);
    expect(res.body.total).toBeGreaterThanOrEqual(0);
    expect(res.body.totalPages).toBeGreaterThanOrEqual(0);
  });

});
