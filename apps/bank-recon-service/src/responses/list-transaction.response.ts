import { z } from "@packages/zod-validator";
import { ErrorResponse } from "./error.response";

export const ListTransactionResponse = z.object({
    ok: z.boolean(),
    message: z.string().optional(),
    error: ErrorResponse.optional(),
    page: z.number().optional(),
    limit:  z.number().optional(),
    total:  z.number().optional(),
    totalPages: z.number().optional(),
    transactions: z.array(z.any()).optional(),
}).openapi({ref: 'ListTransactionResponse'})