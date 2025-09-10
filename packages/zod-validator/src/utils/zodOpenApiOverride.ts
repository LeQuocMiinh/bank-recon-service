import { input, output, z, ZodTypeAny } from 'zod';
import {
  ReplaceDate,
  ZodOpenApiMetadata,
} from 'zod-openapi/dist/extendZodTypes';

export const extendZodWithCustomOpenApi = () => {
  if ((z.ZodType.prototype as any)._openapiPatched) return;

  const originalOpenApi = z.ZodType.prototype.openapi;
  z.ZodType.prototype.openapi = function <T extends ZodTypeAny>(
    this: T,
    config: ZodOpenApiMetadata<
      T,
      | Exclude<ReplaceDate<input<T>>, undefined>
      | Exclude<ReplaceDate<output<T>>, undefined>
    >,
  ): T {
    if (config.ref) {
      config.ref = `V3${config.ref}`.replace('Dto', 'Request');
    }
    return originalOpenApi.call(this, config as any) as T;
  };

  (z.ZodType.prototype as any)._openapiPatched = true;
};
