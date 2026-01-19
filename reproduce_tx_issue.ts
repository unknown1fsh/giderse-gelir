import { PrismaClient } from '@prisma/client';
import { AuthService } from './server/services/impl/AuthService';
import { TransactionService } from './server/services/impl/TransactionService';
import { RegisterUserDTO } from './server/dto/UserDTO';

const prisma = new PrismaClient();

async function main() {
    const authService = new AuthService(prisma);
    const txService = new TransactionService(prisma);

    const email = `test-repro-${Date.now()}@test.com`;
    console.log(`Creating test user: ${email}`);

    const registerDTO = new RegisterUserDTO({
        username: `repro${Date.now()}`,
        email,
        password: 'Test123456',
        name: 'Repro User'
    });

    const user = await authService.register(registerDTO);
    console.log(`User created. ID: ${user.id}`);

    // Activate user in DB
    await prisma.user.update({
        where: { id: user.id },
        data: { isActive: true }
    });

    // Find "Nakit" account
    const account = await prisma.account.findFirst({
        where: { userId: user.id, name: 'Nakit' }
    });
    console.log(`Nakit Account found: ${account?.id}`);

    // Find "Gelir" type
    const txType = await prisma.refTxType.findFirst({ where: { code: 'GELIR' } });
    console.log(`GELIR TxType: ${txType?.id}`);

    // Find a category for Gelir (e.g., Maaş if exists, otherwise first one)
    const category = (await prisma.refTxCategory.findFirst({
        where: { txTypeId: txType?.id, name: { contains: 'Maaş' } }
    })) || (await prisma.refTxCategory.findFirst({ where: { txTypeId: txType?.id } }));
    console.log(`Category: ${category?.name} (${category?.id})`);

    // Find "Havale/EFT" SystemParameter
    const paymentMethodParam = await prisma.systemParameter.findFirst({
        where: { paramGroup: 'PAYMENT_METHOD', paramCode: 'HAVALE_EFT' }
    });
    console.log(`PaymentMethod Param (HAVALE_EFT): ${paymentMethodParam?.id}`);

    // Find "TRY" RefCurrency (UI sends this ID)
    const refCurrency = await prisma.refCurrency.findFirst({
        where: { code: 'TRY' }
    });
    console.log(`RefCurrency (TRY): ${refCurrency?.id}`);

    if (!account || !txType || !category || !paymentMethodParam || !refCurrency) {
        console.error('Missing ref data/account, cannot proceed with repro.');
        return;
    }

    console.log('\n--- Attempting to create Transaction ---');
    try {
        const transaction = await txService.create({
            userId: user.id,
            txTypeId: txType.id,
            categoryId: category.id,
            paymentMethodId: paymentMethodParam.id,
            accountId: account.id,
            amount: 5000,
            currencyId: refCurrency.id,
            transactionDate: new Date(),
            description: 'Test Repro Maaş'
        });
        console.log('SUCCESS:', transaction);
    } catch (error: any) {
        console.error('FAILURE:', error.message);
        if (error.stack) {console.error(error.stack);}
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
