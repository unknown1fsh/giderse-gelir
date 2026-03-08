-- Faz 1 UX foundation schema

CREATE TABLE "budget_plan" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "period_id" INTEGER,
    "name" VARCHAR(120) NOT NULL DEFAULT 'Varsayilan Butce',
    "period_type" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "zero_based" BOOLEAN NOT NULL DEFAULT true,
    "rollover_mode" VARCHAR(20) NOT NULL DEFAULT 'none',
    "total_budgeted" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_plan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "budget_allocation" (
    "id" SERIAL NOT NULL,
    "budget_plan_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "alert_threshold" DECIMAL(5,2) NOT NULL DEFAULT 80,
    "rollover_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_allocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "budget_alert" (
    "id" SERIAL NOT NULL,
    "budget_plan_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "type" VARCHAR(30) NOT NULL,
    "threshold_percent" DECIMAL(5,2),
    "actual_amount" DECIMAL(15,2),
    "budget_amount" DECIMAL(15,2),
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT "budget_alert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "channel" VARCHAR(20) NOT NULL DEFAULT 'in_app',
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "dedupe_key" VARCHAR(200),
    "payload" JSONB DEFAULT '{}'::jsonb,
    "scheduled_for" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "source_entity_type" VARCHAR(50),
    "source_entity_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "push_subscription" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh_key" TEXT NOT NULL,
    "auth_key" TEXT NOT NULL,
    "user_agent" VARCHAR(255),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saved_view" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "entity_type" VARCHAR(30) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "filters" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "sort" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_view_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "budget_allocation_budget_plan_id_category_id_key" ON "budget_allocation"("budget_plan_id", "category_id");
CREATE UNIQUE INDEX "notification_dedupe_key_key" ON "notification"("dedupe_key");
CREATE UNIQUE INDEX "push_subscription_endpoint_key" ON "push_subscription"("endpoint");

CREATE INDEX "budget_plan_user_id_active_period_type_idx" ON "budget_plan"("user_id", "active", "period_type");
CREATE INDEX "budget_plan_user_id_start_date_end_date_idx" ON "budget_plan"("user_id", "start_date", "end_date");
CREATE INDEX "budget_allocation_category_id_idx" ON "budget_allocation"("category_id");
CREATE INDEX "budget_alert_user_id_triggered_at_idx" ON "budget_alert"("user_id", "triggered_at");
CREATE INDEX "budget_alert_budget_plan_id_triggered_at_idx" ON "budget_alert"("budget_plan_id", "triggered_at");
CREATE INDEX "notification_user_id_channel_read_at_idx" ON "notification"("user_id", "channel", "read_at");
CREATE INDEX "notification_user_id_status_created_at_idx" ON "notification"("user_id", "status", "created_at");
CREATE INDEX "notification_user_id_type_created_at_idx" ON "notification"("user_id", "type", "created_at");
CREATE INDEX "push_subscription_user_id_active_idx" ON "push_subscription"("user_id", "active");
CREATE INDEX "saved_view_user_id_entity_type_is_default_idx" ON "saved_view"("user_id", "entity_type", "is_default");
CREATE INDEX "saved_view_user_id_entity_type_is_system_idx" ON "saved_view"("user_id", "entity_type", "is_system");
CREATE INDEX "transaction_user_id_transaction_date_idx" ON "transaction"("user_id", "transaction_date");
CREATE INDEX "transaction_user_id_category_id_transaction_date_idx" ON "transaction"("user_id", "category_id", "transaction_date");
CREATE INDEX "transaction_user_id_tx_type_id_transaction_date_idx" ON "transaction"("user_id", "tx_type_id", "transaction_date");

ALTER TABLE "budget_plan"
    ADD CONSTRAINT "budget_plan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budget_plan"
    ADD CONSTRAINT "budget_plan_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "period"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budget_plan"
    ADD CONSTRAINT "budget_plan_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "ref_currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "budget_allocation"
    ADD CONSTRAINT "budget_allocation_budget_plan_id_fkey" FOREIGN KEY ("budget_plan_id") REFERENCES "budget_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budget_allocation"
    ADD CONSTRAINT "budget_allocation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ref_tx_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "budget_alert"
    ADD CONSTRAINT "budget_alert_budget_plan_id_fkey" FOREIGN KEY ("budget_plan_id") REFERENCES "budget_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budget_alert"
    ADD CONSTRAINT "budget_alert_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification"
    ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "push_subscription"
    ADD CONSTRAINT "push_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saved_view"
    ADD CONSTRAINT "saved_view_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
