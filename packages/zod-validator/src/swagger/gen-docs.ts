import { OpenAPIV3_1 } from 'openapi-types';
import { createDocument } from 'zod-openapi';

import { genEnumComponents, genSchemaComponents } from './gen-components';
import { DocsSwagger } from './interface';

export function genDocs(docs: DocsSwagger): OpenAPIV3_1.Document {
  const document = createDocument({
    openapi: '3.1.0',
    info: docs.info,
  }) as OpenAPIV3_1.Document;

  const enumSchemasComponents = genEnumComponents(docs.enumSchemas);
  const schemasComponents = genSchemaComponents(docs.schemas);
  document.components = document.components || {};
  document.components.schemas = document.components.schemas || {};
  Object.assign(
    document.components.schemas,
    enumSchemasComponents,
    schemasComponents,
  );

  return document;
}
