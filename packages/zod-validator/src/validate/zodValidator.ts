import { MiddlewareHandler } from 'hono';
import {
  ZodArray,
  ZodEffects,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodSchema,
  ZodType,
} from 'zod';

import { handleErrors } from '../utils';

type SourceType = 'json' | 'query' | 'header' | 'form-data';

export const zodValidator = <T extends ZodSchema<any>>(
  schema: T,
  source: SourceType = 'json',
  ctxKey: string,
): MiddlewareHandler => {
  return async (c, next) => {
    let data: any;
    try {
      if (source === 'json') {
        data = await c.req.json();
      } else if (source === 'query') {
        const arrayField = extractArrayFields(schema);
        data = await c.req.query();

        arrayField.forEach((field) => {
          const queries = c.req.queries(field) || c.req.queries(`${field}[]`);
          delete data[`${field}[]`];
          data[field] = queries;
        });
      } else if (source === 'header') {
        data = await c.req.header();
      } else if (source === 'form-data') {
        const arrayField = extractArrayFields(schema);

        const fromData = await c.req.formData();

        data = Object.fromEntries((fromData as any).entries());

        arrayField.forEach((field) => {
          const schemaResult = findSchemaByPath(schema, field);
          const checkObject = checkObjectField(schemaResult as any);
          if (checkObject) {
            const objectField = getFieldObject(schemaResult as any);
            data[field] = {};

            let result: any[] = [];
            let status = true;
            let count = 0;

            while (status) {
              const checkSchema: boolean[] = [];
              const grouped: any = {};

              objectField.forEach((key) => {
                const isArray = checkArrayField(schemaResult as any, key);
                let value;
                if (isArray) {
                  value = fromData.getAll(`${field}[${count}].${key}`);
                  delete data[`${field}[${count}].${key}`];
                } else {
                  value = fromData.get(`${field}[${count}].${key}`);
                  delete data[`${field}[${count}].${key}`];
                }

                grouped[key] = value;
                checkSchema.push(fromData.has(`${field}[${count}].${key}`));
              });

              if (checkSchema.every((value) => value === false)) {
                status = false;
              } else {
                result.push(grouped);
                count++;
              }
            }
            data[field] = result;
          } else {
            const result = fromData.getAll(field);
            data[field] = result;
          }
        });
      }

      const result = schema.safeParse(data);
      if (!result.success) {
        const rs = handleErrors(result.error.issues);
        return c.json(rs, 400);
      }

      c.set(ctxKey, result.data);
      await next();
    } catch (error) {
      console.error('Zod-Validate: Error occurred:', error);
      return c.text('Internal Server Error', 500);
    }
  };
};

function extractArrayFields(schema: ZodSchema<any>): string[] {
  const arrayFields: string[] = [];

  function processSchema(currentSchema: ZodType<any>, path: string = '') {
    if (
      currentSchema instanceof ZodOptional ||
      currentSchema instanceof ZodNullable
    ) {
      return processSchema(currentSchema._def.innerType, path);
    }

    if (currentSchema instanceof ZodArray) {
      if (path) {
        arrayFields.push(path);
      }
    }

    if (currentSchema instanceof ZodEffects) {
      return processSchema(currentSchema._def.schema, path);
    }

    if (currentSchema instanceof ZodObject) {
      const shape = currentSchema._def.shape();

      for (const [key, fieldSchema] of Object.entries(shape)) {
        const newPath = path ? `${path}.${key}` : key;
        processSchema(fieldSchema as ZodType<any>, newPath);
      }
    }
  }

  processSchema(schema);
  return arrayFields;
}

function findSchemaByPath(
  schema: ZodSchema<any>,
  path: string,
): ZodType<any> | undefined {
  let currentSchema: any = schema;

  const shape = schema._def;

  for (const [key, fieldSchema] of Object.entries((shape as any).shape())) {
    if (key === path) {
      currentSchema = fieldSchema;
    }
  }

  return currentSchema;
}

function checkArrayField(schema: ZodSchema<any>, path: string): boolean {
  const shape = schema._def as any;

  let data;
  if (shape.type !== undefined) {
    data = shape.type._def.shape();
  } else {
    data = shape.innerType._def.type._def.shape();
  }

  for (const [key, fieldSchema] of Object.entries(data)) {
    if (path === key) {
      if (fieldSchema instanceof ZodArray) {
        return true;
      }
      if (fieldSchema instanceof ZodEffects) {
        if (fieldSchema._def.schema._def.schema instanceof ZodArray) {
          return true;
        }
      }
    }
  }
  return false;
}

function checkObjectField(schema: any): boolean {
  try {
    const shape = schema._def;

    if (shape.type instanceof ZodObject) {
      return true;
    }

    if (shape.type instanceof ZodEffects) {
      if (shape.type._def instanceof ZodObject) {
        return true;
      }
    }

    if (shape.innerType._def == undefined) {
      return false;
    }

    if (shape.innerType instanceof ZodArray) {
      if (shape.innerType._def.type instanceof ZodObject) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function getFieldObject(schema: any): string[] {
  const shape = schema._def;

  let data;
  if (shape.type !== undefined) {
    data = shape.type._def.shape();
  } else {
    data = shape.innerType._def.type._def.shape();
  }

  const field: string[] = [];
  for (const [key, fieldSchema] of Object.entries(data)) {
    field.push(key);
  }
  return field;
}
