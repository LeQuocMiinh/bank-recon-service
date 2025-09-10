import request from 'supertest';

const PORT = 3001;
describe("Login", () => {

  it('should fail with invalid DTO', async () => {
    const invalidPayload = { email: 'bad-email', password: '123' };
    const res = await request(`http://localhost:${PORT}`)
      .post('/auth/login')
      .send(invalidPayload)
      .set('Accept', 'application/json');

    expect(res.body.ok).toBe(false);
  });

  it("should succeed when DTO is valid", async () => {
    const validPayload = {
      email: "minh@gmail.com",
      password: "123456"
    };

    const res = await request(`http://localhost:${PORT}`)
      .post('/auth/login')
      .send(validPayload)
      .set('Accept', 'application/json');

    expect(res.body.ok).toBe(true);
  });

});
