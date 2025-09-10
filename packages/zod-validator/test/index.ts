import { z } from '../src';
import { openAPI } from '../src';

export const GetProductDto = z
  .object({
    id: z.array(z.string()),
    name: z.string().optional(),
  })
  .openapi({ ref: 'GetProductDto' });

export const GetProductResponse = z
  .object({
    ok: z.boolean().describe('Get Product Result'),
    data: GetProductDto,
  })
  .openapi({ ref: 'GetProductResponse' });

export const UserMetadataDto = z
  .object({
    'x-user-id': z.string().min(11).describe('x-user identity'),
    'x-country-code': z.string().describe('code of x-country'),
    'x-client-ip': z.string().describe('ip of x-client'),
    'x-geo-data': z.string().describe('data of x-geo'),
    'x-device-id': z.string().describe('x-device identity'),
  })
  .openapi({ ref: 'UserMetadataDto' });

const swagger = openAPI({
  operationId: 'get',
  tag: 'test',
  request: GetProductDto,
  response: GetProductResponse,
  header: UserMetadataDto,
  dataSource: 'query',
});

const sym = Object.getOwnPropertySymbols(swagger).find(
  (s) => s.toString() === 'Symbol(openapi)',
);

if (sym) {
  const { resolver } = swagger[sym];
  const jsonSpec = resolver();
  jsonSpec.then((res) => {
    console.log(res);
  });
}
