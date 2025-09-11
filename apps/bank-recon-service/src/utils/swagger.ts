import { Hono } from 'hono';
import * as Dtos from '../dtos';
import * as Response from '../responses';
import { setupSwagger } from '@packages/zod-validator';

export function swaggerConfig(app: Hono, prefix: string) {
	setupSwagger(app, prefix, {
		info: {
			title: 'Bank Recon Service',
			description: 'Bank Recon Service Swagger',
			version: '1.0.0',
		},
		schemas: { ...Dtos, ...Response },
		enumSchemas: {},
	});
}
