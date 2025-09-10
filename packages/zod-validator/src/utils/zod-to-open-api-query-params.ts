import {
  ZodDefault,
  ZodEffects,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodTypeAny,
} from 'zod';
import { createSchema } from 'zod-openapi';

function unwrapZodType(type: ZodTypeAny): {
  type: ZodTypeAny;
  isOptional: boolean;
} {
  let current: ZodTypeAny = type;
  let isOptional = false;

  while (true) {
    if (current instanceof ZodOptional || current instanceof ZodDefault) {
      isOptional = true;
      current = current._def.innerType as ZodTypeAny;
    } else if (current instanceof ZodNullable) {
      current = current._def.innerType as ZodTypeAny;
    } else if (current instanceof ZodEffects) {
      current = current._def.schema as ZodTypeAny;
    } else {
      break;
    }
  }

  return { type: current, isOptional };
}

export function zodToOpenAPIQueryParams(zodSchema: ZodObject<any>): any[] {
  if (zodSchema instanceof ZodEffects) {
    zodSchema = (zodSchema as any)._def.schema;
    if (zodSchema instanceof ZodEffects) {
      zodSchema = (zodSchema as any)._def.schema;
    }
  }

  const shape = zodSchema.shape;

  return Object.entries(shape).map(([key, value]) => {
    const { type: baseSchema, isOptional } = unwrapZodType(value as any);

    const openApiSchema = createSchema(baseSchema).schema;

    return {
      name: key,
      in: 'query',
      required: !isOptional,
      schema: openApiSchema,
    };
  });
}

export function zodToOpenAPIHeaderParams(zodSchema: ZodObject<any>): any[] {
  const shape = zodSchema.shape;

  return Object.entries(shape).map(([key, value]) => {
    const { type: baseSchema, isOptional } = unwrapZodType(value as any);

    const openApiSchema = createSchema(baseSchema).schema;

    return {
      name: key,
      in: 'header',
      required: !isOptional,
      schema: openApiSchema,
    };
  });
}
