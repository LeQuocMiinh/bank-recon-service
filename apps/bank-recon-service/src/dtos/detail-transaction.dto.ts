import { z } from '@packages/zod-validator';

export const DetailTransactionDto = z
	.object({
		id: z.coerce.number().min(0),
	})
	.openapi({ ref: 'DetailTransactionDto' });
