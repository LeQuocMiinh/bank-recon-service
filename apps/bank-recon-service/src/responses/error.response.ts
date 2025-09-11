import { z } from '@packages/zod-validator';

export const ErrorResponse = z
	.object({
		code: z.number(),
		message: z.string(),
		details: z.array(z.string()),
	})
	.openapi({ ref: 'ErrorResponse' });
