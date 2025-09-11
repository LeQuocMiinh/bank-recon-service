import { z } from '@packages/zod-validator';

export const ListTransactionDto = z
	.object({
		page: z.coerce.number().min(1).optional(),
		limit: z.coerce.number().min(1).optional(),
	})
	.openapi({ ref: 'ListTransactionDto' });
