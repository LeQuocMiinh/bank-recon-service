import { portgressDb } from '../../src/stores';
import request from 'supertest';

const PORT = 3001;
describe('Register', () => {
	beforeAll(async () => {});

	afterAll(async () => {
		await portgressDb.user.delete({
			where: {
				email: 'test@example.com',
			},
		});
	});

	it('should fail with invalid DTO', async () => {
		const invalidPayload = { email: 'bad-email', password: '123' };
		const res = await request(`http://localhost:${PORT}`).post('/auth/register').send(invalidPayload).set('Accept', 'application/json');

		expect(res.body.ok).toBe(false);
	});

	it('should succeed when DTO is valid', async () => {
		const validPayload = {
			email: 'test@example.com',
			password: '123456',
		};

		const res = await request(`http://localhost:${PORT}`).post('/auth/register').send(validPayload).set('Accept', 'application/json');

		expect(res.body.ok).toBe(true);
	});
});
