export default async function globalTeardown() {
	console.log('🔴 Global teardown started');

	const server = (globalThis as any).TEST_SERVER;
	if (server) server.close();

	console.log('🟢 Global teardown finished');
}
