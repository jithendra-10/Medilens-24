
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReports() {
    try {
        const reports = await prisma.report.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        console.log(JSON.stringify(reports, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkReports();
