-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "loan_id" INTEGER;

-- CreateTable
CREATE TABLE "goal" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "target_amount" DECIMAL(15,2) NOT NULL,
    "current_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency_id" INTEGER NOT NULL,
    "target_date" DATE,
    "category" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "icon" VARCHAR(50),
    "color" VARCHAR(20),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "loan_type" VARCHAR(50) NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "installment_count" INTEGER NOT NULL,
    "remaining_installments" INTEGER NOT NULL DEFAULT 0,
    "interest_rate" DECIMAL(5,2),
    "payment_day" INTEGER NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_fictional" BOOLEAN NOT NULL DEFAULT false,
    "monthly_payment" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goal_user_id_status_idx" ON "goal"("user_id", "status");

-- CreateIndex
CREATE INDEX "loan_user_id_is_active_idx" ON "loan"("user_id", "is_active");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal" ADD CONSTRAINT "goal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal" ADD CONSTRAINT "goal_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "ref_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan" ADD CONSTRAINT "loan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan" ADD CONSTRAINT "loan_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "ref_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan" ADD CONSTRAINT "loan_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "ref_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
