import { PrismaClient } from '@prisma/client';

export function createPrismaTestClient() {
	return new PrismaClient({
		datasources: {
			db: {
				url: 'file:memory:?cache=shared',
			},
		},
	});
}
