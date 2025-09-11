import { z } from '@packages/zod-validator';
import { ErrorResponse } from './error.response';

export const GetDetailTransactionResponse = z
    .object({
        ok: z.boolean(),
        error: ErrorResponse.optional(),
        data: z.any()
    })
    .openapi({ ref: 'GetDetailTransactionResponse' });
