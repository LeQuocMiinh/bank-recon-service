import { z } from 'zod';

declare module 'zod' {
  interface ZodType<Output, Def, Input> {
    openapi(options: {
      ref?: string;
      effectType?: string;
      [key: string]: any;
    }): this;
    describe(description: string): this;
  }

  interface ZodEffects<T extends z.ZodTypeAny, Output, Input> {
    openapi(options: {
      ref?: string;
      effectType?: string;
      [key: string]: any;
    }): this;
  }

  interface ZodObject<
    T extends z.ZodRawShape,
    UnknownKeys,
    Catchall,
    Output,
    Input,
  > {
    openapi(options: { ref?: string; [key: string]: any }): this;
  }
}

import { extendZodWithOpenApi } from 'zod-openapi';

import { extendZodWithCustomOpenApi } from './zodOpenApiOverride';

extendZodWithOpenApi(z);
extendZodWithCustomOpenApi();

export { z };
