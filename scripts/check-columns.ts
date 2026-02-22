import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, character_maximum_length 
    FROM information_schema.columns 
    WHERE table_name = 'user_session';
  `);
    console.log(result);
}

main().finally(() => prisma.$disconnect());
