import { ZodType } from 'zod';
import { createSchema } from 'zod-openapi';

export function genEnumComponents(enums: Record<string, any>): object {
  let Schemas = {};

  for (const [enumName, enumSchema] of Object.entries(enums)) {
    if (isNativeEnum(enumSchema)) {
      const enumComponents = generateNativeEnumComponents(
        `V3${enumName}`.replace('Dto', 'Request'),
        enumSchema,
      );
      if (enumComponents) {
        Schemas = {
          ...Schemas,
          ...enumComponents,
        };
      }
    }
  }

  return Schemas;
}

export function genSchemaComponents(schemas: Record<string, any>): object {
  const Schemas = {};

  for (const [itemName, itemSchema] of Object.entries(schemas)) {
    if (!itemSchema || typeof itemSchema !== 'object') {
      continue;
    }

    if (!isZodType(itemSchema)) {
      continue;
    }

    const { components } = createSchema(itemSchema as ZodType, {
      schemaType: 'input',
      openapi: '3.1.0',
    });

    if (components === undefined) {
      continue;
    }

    const filteredComponents = Object.fromEntries(
      Object.entries(components as Record<string, any>).filter(
        ([_, value]) => !('enum' in value),
      ),
    );
    if (components) {
      for (const [key, value] of Object.entries(filteredComponents)) {
        Schemas[key] = {
          ...(Schemas[key] || {}),
          ...value,
        };
      }
    }
  }

  return Schemas;
}

function isNativeEnum(obj: any): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;
  return keys.some((key) => !isNaN(Number(key)));
}

function isZodType(obj: any): boolean {
  return (
    obj &&
    typeof obj === 'object' &&
    '_def' in obj &&
    typeof obj.parse === 'function' &&
    typeof obj.safeParse === 'function'
  );
}

function generateNativeEnumComponents(enumName: string, enumObj: any): object {
  try {
    const enumValues: any[] = [];
    const enumVarNames: string[] = [];

    const sampleValue = Object.keys(enumObj)[0];

    const isNumericEnum = !Number.isNaN(sampleValue);

    if (isNumericEnum) {
      Object.entries(enumObj).forEach(([key, value]) => {
        if (typeof value === 'number') {
          enumValues.push(value);
          enumVarNames.push(key);
        }
      });
    } else {
      Object.entries(enumObj).forEach(([key, value]) => {
        if (typeof value === 'string' && !enumValues.includes(value)) {
          enumValues.push(key);
          enumVarNames.push(value);
        }
      });
    }

    return {
      [enumName]: {
        type: isNumericEnum ? 'number' : 'string',
        enum: enumValues,
        'x-enum-varnames': enumVarNames,
      },
    };
  } catch (error) {
    console.warn(`Failed to process enum: ${enumName}`, error);
    return {};
  }
}
