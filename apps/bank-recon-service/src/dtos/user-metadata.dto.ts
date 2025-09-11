import { z } from '@packages/zod-validator';

export const UserMetadataDto = z
	.object({
		'x-client-ip': z.string().optional().describe('ip of x-client'),
	})
	.openapi({ ref: 'UserMetadataDto' });
