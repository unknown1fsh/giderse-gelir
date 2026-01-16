-- AlterTable
ALTER TABLE "user" ADD COLUMN     "reset_password_expiry" TIMESTAMP(3),
ADD COLUMN     "reset_password_token" VARCHAR(255),
ADD COLUMN     "username_change_count" INTEGER NOT NULL DEFAULT 0;
