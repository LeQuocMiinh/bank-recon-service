import request from 'supertest';
import { ListTransactionDto } from '../../src/dtos';
import { portgressDb } from '../../src/stores';

const PORT = 3001;
const baseUrl = `http://localhost:${PORT}`;

export async function register(email: string, password: string) {
	const res = await request(baseUrl).post('/auth/register').send({ email, password }).set('Accept', 'application/json');
	return res.body.token;
}

describe('List Transactions', () => {
	let token: string;

	beforeAll(async () => {
		token = await register('minh456@gmail.com', '123456');
	});

	afterAll(async () => {
		const user = await portgressDb.user.findFirst({
			where: { email: 'minh456@gmail.com' },
		});

		if (user) {
			await portgressDb.user.deleteMany({
				where: { email: 'minh456@gmail.com' },
			});
		}
	});

	it('should return 401 if user is not authenticated', async () => {
		const res = await request(baseUrl).get('/transaction/list').set('Accept', 'application/json');

		expect(res.body).toEqual({ error: 'Unauthorized', ok: false });
	});

	it('should pass validation with valid page and limit', () => {
		const data = { page: 2, limit: 10 };
		const result = ListTransactionDto.safeParse(data);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.page).toBe(2);
			expect(result.data.limit).toBe(10);
		}
	});

	it('should fail validation when page or limit is less than 1 or invalid', () => {
		const invalidData = { page: 0, limit: -5 };
		const result = ListTransactionDto.safeParse(invalidData);
		expect(result.success).toBe(false);
	});
});
