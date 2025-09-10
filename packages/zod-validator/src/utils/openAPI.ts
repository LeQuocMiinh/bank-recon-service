import { MiddlewareHandler } from 'hono';
import { describeRoute, DescribeRouteOptions } from 'hono-openapi';
import { ZodType } from 'zod';
import { createSchema, CreateSchemaOptions } from 'zod-openapi';

import {
  zodToOpenAPIHeaderParams,
  zodToOpenAPIQueryParams,
} from './zod-to-open-api-query-params';
import {
  ReferenceObject,
  SchemaObject,
} from 'zod-openapi/dist/openapi3-ts/dist/oas30';

type SourceType = 'json' | 'query';

export function openAPI(data: {
  operationId: string;
  tag?: string;
  request?: ZodType;
  response: ZodType;
  events: ZodType[];
  description: string;
  header?: ZodType;
  dataSource: SourceType;
}): MiddlewareHandler {
  const schemaOptions: CreateSchemaOptions = {
    schemaType: 'input',
    openapi: '3.1.0',
  };
  const { schema: responseSchema } = createSchema(data.response, {
    ...schemaOptions,
    schemaType: 'output',
  });

  let eventSchemas: (SchemaObject | ReferenceObject)[] = [];

  data.events.forEach((event) => {
    const { schema: eventSchema } = createSchema(event, {
      ...schemaOptions,
      schemaType: 'output',
    });
    if (eventSchema) {
      eventSchemas.push(eventSchema as SchemaObject | ReferenceObject);
    }
  });

  const eventSchemasString = eventSchemas
    .map((schema) => JSON.stringify(schema))
    .join('#$#');

  const headerParams = zodToOpenAPIHeaderParams(data.header as any) ?? [];

  let options: DescribeRouteOptions = {
    tags: [data.tag || 'Default'],
    parameters: [...headerParams],
  };

  if (data.request) {
    if (data.dataSource === 'json') {
      const { schema: requestSchema } = createSchema(
        data.request,
        schemaOptions,
      );

      options = {
        ...options,
        requestBody: {
          content: {
            'application/json': {
              schema: requestSchema as any,
            },
          },
        },
      };
    }

    if (data.dataSource === 'query') {
      options.parameters = [
        ...headerParams,
        ...zodToOpenAPIQueryParams(data.request as any),
      ];
    }
  }

  return describeRoute({
    operationId: data.operationId,
    ...options,
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: responseSchema as any,
          },
        },
      },
    },
    summary: eventSchemasString,
    description: data.description,
  });
}
