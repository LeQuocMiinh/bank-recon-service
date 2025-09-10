import { z } from "@packages/zod-validator";
import { ErrorResponse } from "./error.response";

export const ImportTransactionResponse = z.object({
    ok: z.boolean(),
    message: z.string().optional(),
    error: ErrorResponse.optional(),
    total: z.number().optional(),
}).openapi({ref: 'ImportTransactionResponse'})