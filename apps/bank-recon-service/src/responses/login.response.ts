import { z } from "@packages/zod-validator";
import { ErrorResponse } from "./error.response";

export const LoginResponse = z.object({
    ok: z.boolean(),
    message: z.string().optional(),
    error: ErrorResponse.optional(),
    token: z.string().optional(),
}).openapi({ ref: 'LoginResponse' });