import { Context } from 'hono';
import bcrypt from 'bcrypt';
import { portgressDb } from '../../stores/db';
import { generateToken } from '../../utils';
import { addCacheExpire, getCache } from '../../stores/redis';

export async function register(c: Context) {
	try {
		const { email, password } = await c.req.json();

		const existing = await portgressDb.user.findUnique({
			where: { email },
		});

		if (existing) {
			return c.json({ ok: false, error: 'User already exists' }, 400);
		}
		const hashed = await bcrypt.hash(password, 10);
		const user = await portgressDb.user.create({
			data: {
				email,
				password: hashed,
			},
			select: {
				id: true,
				email: true,
				createdAt: true,
			},
		});
		const token = generateToken({
			userId: user.id,
			email: user.email,
		});

		addCacheExpire(user.email, token);

		return c.json(
			{
				ok: true,
				message: 'User registered successfully',
				token,
			},
			201,
		);
	} catch (err) {
		console.error(err);
		return c.json({ ok: false, error: 'Internal Server Error' }, 500);
	}
}

export async function login(c: Context) {
	try {
		const { email, password } = await c.req.json();

		const user = await portgressDb.user.findUnique({
			where: { email },
		});

		if (!user) {
			return c.json({ ok: false, error: 'Invalid credentials' }, 401);
		}

		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			return c.json({ ok: false, error: 'Invalid credentials' }, 401);
		}

		const tokenExist = await getCache(user.email);

		if (tokenExist) {
			return c.json({ ok: true, message: 'Login successful', token: tokenExist }, 201);
		}

		const token = generateToken({
			userId: user.id,
			email: user.email,
		});

		addCacheExpire(user.email, token);

		return c.json({ ok: true, message: 'Login successful', token }, 201);
	} catch (err) {
		console.error(err);
		return c.json({ ok: false, error: 'Internal Server Error' }, 500);
	}
}
