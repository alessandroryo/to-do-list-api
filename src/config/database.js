const { PrismaClient } = require('@prisma/client');

/**
 * Initialize Prisma client
 * @type {import('@prisma/client').PrismaClient}
 */
const prisma = new PrismaClient();

// Handle potential errors on the Prisma instance
prisma.$on('error', e => {
	console.error('Prisma Error:', e);
});

// Gracefully disconnect Prisma on application shutdown
process.on('SIGINT', async () => {
	await prisma.$disconnect();
	process.exit();
});

module.exports = prisma;
