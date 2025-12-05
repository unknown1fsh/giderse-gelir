/*
  Warnings:

  - You are about to drop the column `is_active` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `auto_payment` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `auto_payment` table. All the data in the column will be lost.
  - You are about to drop the column `account_number` on the `beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `period_id` on the `beneficiary` table. All the data in the column will be lost.
  - You are about to drop the column `card_number` on the `credit_card` table. All the data in the column will be lost.
  - You are about to drop the column `current_debt` on the `credit_card` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `credit_card` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `e_wallet` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_type` on the `e_wallet` table. All the data in the column will be lost.
  - You are about to drop the column `current_value` on the `gold_item` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `gold_item` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `gold_item` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `investment` table. All the data in the column will be lost.
  - You are about to drop the column `current_value` on the `investment` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `investment` table. All the data in the column will be lost.
  - You are about to drop the column `currency_id` on the `portfolio_snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `period_id` on the `portfolio_snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `portfolio_snapshot` table. All the data in the column will be lost.
  - You are about to alter the column `symbol` on the `ref_currency` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `VarChar(5)`.
  - You are about to alter the column `param_value` on the `system_parameter` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the `ref_transaction_category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ref_transaction_type` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,snapshot_date]` on the table `portfolio_snapshot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ascii_name]` on the table `ref_bank` will be added. If there are existing duplicate values, this will fail.
  - Made the column `bank_id` on table `account` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `category_id` to the `auto_payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cron_schedule` to the `auto_payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `payment_method_id` on table `auto_payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `limit_amount` on table `credit_card` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `provider` to the `e_wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight_grams` to the `gold_item` table without a default value. This is not possible if the table is not empty.
  - Made the column `purchase_price` on table `gold_item` required. This step will fail if there are existing NULL values in that column.
  - Made the column `purchase_date` on table `gold_item` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `purchase_price` to the `investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `risk_level` to the `investment` table without a default value. This is not possible if the table is not empty.
  - Made the column `purchase_date` on table `investment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `breakdown` to the `portfolio_snapshot` table without a default value. This is not possible if the table is not empty.
  - Made the column `ascii_name` on table `ref_bank` required. This step will fail if there are existing NULL values in that column.
  - Made the column `symbol` on table `ref_currency` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payment_method_id` on table `transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transaction_date` on table `transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_bank_id_fkey";

-- DropForeignKey
ALTER TABLE "auto_payment" DROP CONSTRAINT "auto_payment_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "beneficiary" DROP CONSTRAINT "beneficiary_period_id_fkey";

-- DropForeignKey
ALTER TABLE "credit_card" DROP CONSTRAINT "credit_card_bank_id_fkey";

-- DropForeignKey
ALTER TABLE "portfolio_snapshot" DROP CONSTRAINT "portfolio_snapshot_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "portfolio_snapshot" DROP CONSTRAINT "portfolio_snapshot_period_id_fkey";

-- DropForeignKey
ALTER TABLE "ref_transaction_category" DROP CONSTRAINT "ref_transaction_category_tx_type_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_category_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_tx_type_id_fkey";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "is_active",
ALTER COLUMN "period_id" DROP NOT NULL,
ALTER COLUMN "bank_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "auto_payment" DROP COLUMN "frequency",
DROP COLUMN "is_active",
ADD COLUMN     "account_id" INTEGER,
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "beneficiary_id" INTEGER,
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "credit_card_id" INTEGER,
ADD COLUMN     "cron_schedule" VARCHAR(100) NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "e_wallet_id" INTEGER,
ALTER COLUMN "period_id" DROP NOT NULL,
ALTER COLUMN "payment_method_id" SET NOT NULL,
ALTER COLUMN "next_payment_date" DROP NOT NULL;

-- AlterTable
ALTER TABLE "beneficiary" DROP COLUMN "account_number",
DROP COLUMN "is_active",
DROP COLUMN "period_id",
ADD COLUMN     "account_no" VARCHAR(50),
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "phone_number" VARCHAR(20);

-- AlterTable
ALTER TABLE "credit_card" DROP COLUMN "card_number",
DROP COLUMN "current_debt",
DROP COLUMN "is_active",
ALTER COLUMN "period_id" DROP NOT NULL,
ALTER COLUMN "limit_amount" SET NOT NULL,
ALTER COLUMN "available_limit" DROP DEFAULT,
ALTER COLUMN "statement_day" DROP DEFAULT,
ALTER COLUMN "due_day" DROP DEFAULT;

-- AlterTable
ALTER TABLE "e_wallet" DROP COLUMN "is_active",
DROP COLUMN "wallet_type",
ADD COLUMN     "account_email" VARCHAR(255),
ADD COLUMN     "account_phone" VARCHAR(20),
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "provider" VARCHAR(50) NOT NULL,
ALTER COLUMN "period_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "gold_item" DROP COLUMN "current_value",
DROP COLUMN "is_active",
DROP COLUMN "weight",
ADD COLUMN     "current_value_try" DECIMAL(15,2),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "weight_grams" DECIMAL(8,3) NOT NULL,
ALTER COLUMN "period_id" DROP NOT NULL,
ALTER COLUMN "purchase_price" SET NOT NULL,
ALTER COLUMN "purchase_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "investment" DROP COLUMN "amount",
DROP COLUMN "current_value",
DROP COLUMN "is_active",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "current_price" DECIMAL(15,2),
ADD COLUMN     "last_price_update" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB DEFAULT '{}',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purchase_price" DECIMAL(15,2) NOT NULL,
ADD COLUMN     "quantity" DECIMAL(18,8) NOT NULL,
ADD COLUMN     "risk_level" VARCHAR(20) NOT NULL,
ADD COLUMN     "symbol" VARCHAR(20),
ALTER COLUMN "period_id" DROP NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "investment_type" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "purchase_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "period" ALTER COLUMN "is_active" SET DEFAULT true;

-- AlterTable
ALTER TABLE "portfolio_snapshot" DROP COLUMN "currency_id",
DROP COLUMN "period_id",
DROP COLUMN "updated_at",
ADD COLUMN     "breakdown" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "ref_bank" ADD COLUMN     "bank_code" VARCHAR(10),
ADD COLUMN     "website" VARCHAR(100),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "ascii_name" SET NOT NULL,
ALTER COLUMN "ascii_name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "ref_currency" ALTER COLUMN "symbol" SET NOT NULL,
ALTER COLUMN "symbol" SET DATA TYPE VARCHAR(5);

-- AlterTable
ALTER TABLE "ref_gold_type" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "ref_tx_category" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ref_tx_type" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "system_parameter" ADD COLUMN     "metadata" JSONB DEFAULT '{}',
ALTER COLUMN "param_value" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "account_id" INTEGER,
ADD COLUMN     "beneficiary_id" INTEGER,
ADD COLUMN     "credit_card_id" INTEGER,
ADD COLUMN     "e_wallet_id" INTEGER,
ADD COLUMN     "is_recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "recurring_type" VARCHAR(20),
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "period_id" DROP NOT NULL,
ALTER COLUMN "payment_method_id" SET NOT NULL,
ALTER COLUMN "transaction_date" SET NOT NULL,
ALTER COLUMN "transaction_date" DROP DEFAULT;

-- DropTable
DROP TABLE "ref_transaction_category";

-- DropTable
DROP TABLE "ref_transaction_type";

-- CreateTable
CREATE TABLE "period_closing" (
    "id" SERIAL NOT NULL,
    "period_id" INTEGER NOT NULL,
    "closed_at" TIMESTAMP(3) NOT NULL,
    "closed_by_user_id" INTEGER NOT NULL,
    "total_assets" DECIMAL(15,2) NOT NULL,
    "total_liabilities" DECIMAL(15,2) NOT NULL,
    "net_worth" DECIMAL(15,2) NOT NULL,
    "transferred_to_next" BOOLEAN NOT NULL DEFAULT false,
    "closing_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "period_closing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "period_transfer" (
    "id" SERIAL NOT NULL,
    "from_period_id" INTEGER NOT NULL,
    "to_period_id" INTEGER NOT NULL,
    "account_id" INTEGER,
    "transfer_amount" DECIMAL(15,2) NOT NULL,
    "transfer_type" VARCHAR(30) NOT NULL,
    "transfer_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "period_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fx_rate" (
    "id" SERIAL NOT NULL,
    "from_currency_id" INTEGER NOT NULL,
    "to_currency_id" INTEGER NOT NULL,
    "rate" DECIMAL(15,6) NOT NULL,
    "rate_date" DATE NOT NULL,
    "source" VARCHAR(50) NOT NULL DEFAULT 'TCMB',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fx_rate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "period_closing_period_id_key" ON "period_closing"("period_id");

-- CreateIndex
CREATE INDEX "period_transfer_from_period_id_idx" ON "period_transfer"("from_period_id");

-- CreateIndex
CREATE INDEX "period_transfer_to_period_id_idx" ON "period_transfer"("to_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "fx_rate_from_currency_id_to_currency_id_rate_date_key" ON "fx_rate"("from_currency_id", "to_currency_id", "rate_date");

-- CreateIndex
CREATE INDEX "account_user_id_period_id_idx" ON "account"("user_id", "period_id");

-- CreateIndex
CREATE INDEX "auto_payment_user_id_period_id_idx" ON "auto_payment"("user_id", "period_id");

-- CreateIndex
CREATE INDEX "credit_card_user_id_period_id_idx" ON "credit_card"("user_id", "period_id");

-- CreateIndex
CREATE INDEX "e_wallet_user_id_period_id_idx" ON "e_wallet"("user_id", "period_id");

-- CreateIndex
CREATE INDEX "gold_item_user_id_period_id_idx" ON "gold_item"("user_id", "period_id");

-- CreateIndex
CREATE INDEX "investment_user_id_period_id_active_idx" ON "investment"("user_id", "period_id", "active");

-- CreateIndex
CREATE INDEX "investment_investment_type_idx" ON "investment"("investment_type");

-- CreateIndex
CREATE INDEX "period_user_id_is_active_idx" ON "period"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "period_user_id_start_date_end_date_idx" ON "period"("user_id", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_snapshot_user_id_snapshot_date_key" ON "portfolio_snapshot"("user_id", "snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "ref_bank_ascii_name_key" ON "ref_bank"("ascii_name");

-- CreateIndex
CREATE INDEX "system_parameter_param_group_is_active_idx" ON "system_parameter"("param_group", "is_active");

-- CreateIndex
CREATE INDEX "transaction_user_id_period_id_idx" ON "transaction"("user_id", "period_id");

-- CreateIndex
CREATE INDEX "transaction_period_id_transaction_date_idx" ON "transaction"("period_id", "transaction_date");

-- RenameForeignKey
ALTER TABLE "ref_tx_category" RENAME CONSTRAINT "ref_tx_category_tx_type_fk" TO "ref_tx_category_tx_type_id_fkey";

-- AddForeignKey
ALTER TABLE "period_closing" ADD CONSTRAINT "period_closing_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_transfer" ADD CONSTRAINT "period_transfer_from_period_id_fkey" FOREIGN KEY ("from_period_id") REFERENCES "period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "period_transfer" ADD CONSTRAINT "period_transfer_to_period_id_fkey" FOREIGN KEY ("to_period_id") REFERENCES "period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "ref_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card" ADD CONSTRAINT "credit_card_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "ref_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ref_tx_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_e_wallet_id_fkey" FOREIGN KEY ("e_wallet_id") REFERENCES "e_wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "ref_payment_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_tx_type_id_fkey" FOREIGN KEY ("tx_type_id") REFERENCES "ref_tx_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_payment" ADD CONSTRAINT "auto_payment_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_payment" ADD CONSTRAINT "auto_payment_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_payment" ADD CONSTRAINT "auto_payment_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ref_tx_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_payment" ADD CONSTRAINT "auto_payment_credit_card_id_fkey" FOREIGN KEY ("credit_card_id") REFERENCES "credit_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_payment" ADD CONSTRAINT "auto_payment_e_wallet_id_fkey" FOREIGN KEY ("e_wallet_id") REFERENCES "e_wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_payment" ADD CONSTRAINT "auto_payment_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "ref_payment_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fx_rate" ADD CONSTRAINT "fx_rate_from_currency_id_fkey" FOREIGN KEY ("from_currency_id") REFERENCES "ref_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fx_rate" ADD CONSTRAINT "fx_rate_to_currency_id_fkey" FOREIGN KEY ("to_currency_id") REFERENCES "ref_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "ref_tx_category_uniq" RENAME TO "ref_tx_category_tx_type_id_code_key";
