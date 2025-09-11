import { z } from '@packages/zod-validator';

export const RegisterDto = z
	.object({
		email: z.string().email(),
		password: z.string().min(6),
	})
	.openapi({ ref: 'RegisterDto' });
