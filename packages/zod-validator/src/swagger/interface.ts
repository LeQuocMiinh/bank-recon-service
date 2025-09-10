export interface DocsSwagger {
  info: {
    title: string;
    version: string;
    description: string;
  };
  schemas: Record<string, any>;
  enumSchemas: Record<string, any>;
}
