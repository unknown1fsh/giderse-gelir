import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ALL Users ---');
    const users = await prisma.user.findMany({
        select: { id: true, email: true, username: true, isActive: true }
    });
    console.log(JSON.stringify(users, null, 2));

    console.log('\n--- TARGETED SEARCH: Maaş Categories ---');
    const categories = await prisma.refTxCategory.findMany({
        include: { txType: true }
    });

    const matches = categories.filter(c => c.name.toLowerCase().includes('maaş'));
    matches.forEach(c => {
        console.log(`- ${c.name} (${c.code}): ${c.txType.name} (Type ID: ${c.txTypeId}, Cat ID: ${c.id})`);
    });

    console.log('\n--- CURRENCY ID COMPARISON ---');
    const refCurrencies = await prisma.refCurrency.findMany();
    console.log('RefCurrencies:');
    refCurrencies.forEach(c => console.log(`- ${c.code}: ID ${c.id}`));

    const currencyParams = await prisma.systemParameter.findMany({
        where: { paramGroup: 'CURRENCY' }
    });
    console.log('\nSystemParameter Currencies:');
    currencyParams.forEach(p => console.log(`- ${p.paramCode}: ID ${p.id}`));

    console.log('\n--- PAYMENT METHODS (SystemParameters) ---');
    const sysParams = await prisma.systemParameter.findMany({
        where: { paramGroup: 'PAYMENT_METHOD' }
    });
    sysParams.forEach(p => console.log(`- ${p.displayName} (${p.paramCode}): ID ${p.id}`));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
