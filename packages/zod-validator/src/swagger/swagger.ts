import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { openAPISpecs } from 'hono-openapi';

import { genDocs } from './gen-docs';
import { DocsSwagger } from './interface';

type HonoAlias = {
  get: (...args: any[]) => any;
};
// Note:
// Don't use the `Hono` type directly here because TypeScript will try to do deep type inference,
// resulting in the error: "type instantiation is excessively deep and possibly infinite".
// This happens due to the complex generic and recursive structure inside the `hono` library.
// Instead, we define `HonoAlias` with only the necessary methods (e.g. `get`, `use`, ...)
// to keep the type simple, safe and avoid compilation errors from TypeScript.
//
// If you need more methods from `Hono` later, extend `HonoAlias` accordingly.

export function setupSwagger(
  app: HonoAlias,
  prefix: string,
  docs: DocsSwagger,
): void {
  const basePath = prefix ? `/${prefix}` : '';

  const openApiSpecs = openAPISpecs(app as Hono, {
    documentation: genDocs(docs) as any,
  });

  // Json For Client
  app.get(`${basePath}/docs`, async (c) => {
    const result = await openApiSpecs(c, async () => {});
    const res = await (result as Response).json();

    for (const route in res.paths) {
      for (const method in res.paths[route]) {
        if (res.paths[route][method].parameters) {
          res.paths[route][method].parameters = res.paths[route][
            method
          ].parameters.filter((param) => param.in !== 'header');
        }
      }
    }

    for (const schema in res.components.schemas) {
      const properties = res.components.schemas[schema].properties;
      if (properties) {
        for (const propName in properties) {
          const prop = properties[propName];
          if (Array.isArray(prop.type) && prop.type.includes('null')) {
            if (prop.type === undefined) continue;

            prop.type = prop.type.filter((type) => type !== 'null');
            prop.type = prop.type.length === 1 ? prop.type[0] : prop.type;
            prop.nullable = true;
            if (prop.type === 'array') {
              if (prop.items.type === undefined) continue;

              prop.items.type = prop.items.type.filter(
                (type) => type !== 'null',
              );
              prop.items.type =
                prop.items.type.length === 1
                  ? prop.items.type[0]
                  : prop.items.type;
              prop.items.nullable = true;
            }
          }
        }
      }
    }

    return c.json(res);
  });

  // Json For Swagger UI
  app.get(`${basePath}/openapi`, openApiSpecs);
  
  app.get(
    `${prefix ? `/${prefix}` : ''}/ui`,
    swaggerUI({ url: `${prefix ? `/${prefix}` : ''}/openapi` }),
  );
}
