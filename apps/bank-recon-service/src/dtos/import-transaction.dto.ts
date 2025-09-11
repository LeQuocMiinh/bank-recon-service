import { z } from '@packages/zod-validator';

export const ImportTransactionDto = z
	.object({
		date: z.string().nonempty(),
		content: z.string().nonempty(),
		amount: z.number(),
		type: z.string().nonempty(),
	})
	.openapi({ ref: 'ImportTransactionDto' });
