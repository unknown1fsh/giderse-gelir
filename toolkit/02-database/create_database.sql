-- ============================================================
-- GiderseGelir — Acil Durum Veritabanı Oluşturma Scripti
-- Üretildi: 2026-03-22 | Kaynak: prisma/schema.prisma
-- Provider: PostgreSQL
--
-- KULLANIM:
--   psql -U postgres -c "CREATE DATABASE giderse_gelir;"
--   psql -U postgres -d giderse_gelir -f toolkit/02-database/create_database.sql
--
-- NOT: Mümkün olduğunca `npx prisma migrate deploy` tercih edilmeli.
-- Bu script yalnızca migration history olmadan sıfırdan kurulum için.
-- ============================================================

-- ============================================================
-- ENUM / TYPE tanımları (gerekirse)
-- ============================================================

-- ============================================================
-- REFERANS TABLOLARI
-- ============================================================

CREATE TABLE IF NOT EXISTS system_parameter (
    id             SERIAL PRIMARY KEY,
    param_group    VARCHAR(50)  NOT NULL,
    param_code     VARCHAR(50)  NOT NULL,
    param_value    VARCHAR(255) NOT NULL,
    display_name   VARCHAR(100) NOT NULL,
    description    TEXT,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    display_order  INTEGER      NOT NULL DEFAULT 0,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    metadata       JSONB                 DEFAULT '{}',
    CONSTRAINT uq_system_parameter UNIQUE (param_group, param_code)
);
CREATE INDEX IF NOT EXISTS idx_system_parameter_group_active ON system_parameter (param_group, is_active);

-- ----

CREATE TABLE IF NOT EXISTS ref_currency (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(3)   NOT NULL UNIQUE,
    name        VARCHAR(50)  NOT NULL,
    symbol      VARCHAR(5)   NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS ref_account_type (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(50)  NOT NULL,
    description TEXT,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS ref_tx_type (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10)  NOT NULL UNIQUE,
    name        VARCHAR(20)  NOT NULL,
    icon        VARCHAR(50),
    color       VARCHAR(20),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS ref_tx_category (
    id          SERIAL PRIMARY KEY,
    tx_type_id  INTEGER      NOT NULL REFERENCES ref_tx_type(id),
    code        VARCHAR(30)  NOT NULL,
    name        VARCHAR(50)  NOT NULL,
    description TEXT,
    icon        VARCHAR(50),
    color       VARCHAR(20),
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ref_tx_category UNIQUE (tx_type_id, code)
);

-- ----

CREATE TABLE IF NOT EXISTS ref_payment_method (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(50)  NOT NULL,
    description TEXT,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS ref_gold_type (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(50)  NOT NULL,
    description TEXT,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS ref_gold_purity (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10)  NOT NULL UNIQUE,
    name        VARCHAR(20)  NOT NULL,
    purity      DECIMAL(3,1) NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS ref_bank (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    ascii_name  VARCHAR(100) NOT NULL UNIQUE,
    swift_bic   VARCHAR(11),
    bank_code   VARCHAR(10),
    website     VARCHAR(100),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- KULLANICI & OTURUM TABLOLARI
-- ============================================================

CREATE TABLE IF NOT EXISTS "user" (
    id                          SERIAL PRIMARY KEY,
    email                       VARCHAR(255) NOT NULL UNIQUE,
    username                    VARCHAR(50)  NOT NULL UNIQUE,
    username_change_count       INTEGER      NOT NULL DEFAULT 0,
    name                        VARCHAR(100),
    phone                       VARCHAR(20),
    password_hash               VARCHAR(255) NOT NULL,
    email_verified              BOOLEAN      NOT NULL DEFAULT FALSE,
    phone_verified              BOOLEAN      NOT NULL DEFAULT FALSE,
    avatar                      VARCHAR(500),
    timezone                    VARCHAR(50)  NOT NULL DEFAULT 'Europe/Istanbul',
    language                    VARCHAR(5)   NOT NULL DEFAULT 'tr',
    currency                    VARCHAR(3)   NOT NULL DEFAULT 'TRY',
    date_format                 VARCHAR(20)  NOT NULL DEFAULT 'DD/MM/YYYY',
    number_format               VARCHAR(20)  NOT NULL DEFAULT '1.234,56',
    theme                       VARCHAR(20)  NOT NULL DEFAULT 'light',
    notifications               JSONB        NOT NULL DEFAULT '{}',
    settings                    JSONB        NOT NULL DEFAULT '{}',
    last_login_at               TIMESTAMP,
    is_active                   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP    NOT NULL DEFAULT NOW(),
    email_verification_token    VARCHAR(255),
    email_verification_expiry   TIMESTAMP,
    reset_password_token        VARCHAR(255),
    reset_password_expiry       TIMESTAMP,
    role                        VARCHAR(20)  NOT NULL DEFAULT 'USER'
);

-- ----

CREATE TABLE IF NOT EXISTS user_session (
    id               TEXT         PRIMARY KEY,
    user_id          INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token            TEXT         NOT NULL UNIQUE,
    active_period_id INTEGER,
    expires_at       TIMESTAMP    NOT NULL,
    user_agent       TEXT,
    ip_address       VARCHAR(45),
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS user_subscription (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    plan_id         VARCHAR(50)  NOT NULL,
    status          VARCHAR(20)  NOT NULL,
    start_date      TIMESTAMP    NOT NULL,
    end_date        TIMESTAMP    NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    currency        VARCHAR(3)   NOT NULL,
    payment_method  VARCHAR(50),
    transaction_id  VARCHAR(100),
    auto_renew      BOOLEAN      NOT NULL DEFAULT TRUE,
    cancelled_at    TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS payment_request (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    plan_id     VARCHAR(50)  NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    currency    VARCHAR(3)   NOT NULL DEFAULT 'TRY',
    description TEXT,
    status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    approved_by INTEGER,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_request_user    ON payment_request (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_request_status  ON payment_request (status);
CREATE INDEX IF NOT EXISTS idx_payment_request_created ON payment_request (created_at);

-- ============================================================
-- DÖNEM TABLOLARI
-- ============================================================

CREATE TABLE IF NOT EXISTS period (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    period_type VARCHAR(20)  NOT NULL,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    is_closed   BOOLEAN      NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_period_user_active ON period (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_period_user_dates  ON period (user_id, start_date, end_date);

ALTER TABLE user_session ADD CONSTRAINT fk_user_session_active_period
    FOREIGN KEY (active_period_id) REFERENCES period(id) DEFERRABLE INITIALLY DEFERRED;

-- ----

CREATE TABLE IF NOT EXISTS period_closing (
    id                  SERIAL PRIMARY KEY,
    period_id           INTEGER      NOT NULL UNIQUE REFERENCES period(id) ON DELETE CASCADE,
    closed_at           TIMESTAMP    NOT NULL,
    closed_by_user_id   INTEGER      NOT NULL,
    total_assets        DECIMAL(15,2) NOT NULL,
    total_liabilities   DECIMAL(15,2) NOT NULL,
    net_worth           DECIMAL(15,2) NOT NULL,
    transferred_to_next BOOLEAN      NOT NULL DEFAULT FALSE,
    closing_notes       TEXT,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS period_transfer (
    id              SERIAL PRIMARY KEY,
    from_period_id  INTEGER      NOT NULL REFERENCES period(id) ON DELETE CASCADE,
    to_period_id    INTEGER      NOT NULL REFERENCES period(id) ON DELETE CASCADE,
    account_id      INTEGER,
    transfer_amount DECIMAL(15,2) NOT NULL,
    transfer_type   VARCHAR(30)  NOT NULL,
    transfer_date   TIMESTAMP    NOT NULL DEFAULT NOW(),
    description     TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_period_transfer_from ON period_transfer (from_period_id);
CREATE INDEX IF NOT EXISTS idx_period_transfer_to   ON period_transfer (to_period_id);

-- ============================================================
-- FİNANSAL VARLIK TABLOLARI
-- ============================================================

CREATE TABLE IF NOT EXISTS account (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    period_id       INTEGER      REFERENCES period(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    account_type_id INTEGER      NOT NULL REFERENCES ref_account_type(id),
    bank_id         INTEGER      NOT NULL REFERENCES ref_bank(id),
    account_number  VARCHAR(50),
    iban            VARCHAR(34),
    balance         DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency_id     INTEGER      NOT NULL REFERENCES ref_currency(id),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_account_user_period ON account (user_id, period_id);

-- ----

CREATE TABLE IF NOT EXISTS credit_card (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    period_id           INTEGER      REFERENCES period(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    bank_id             INTEGER      NOT NULL REFERENCES ref_bank(id),
    limit_amount        DECIMAL(15,2) NOT NULL,
    available_limit     DECIMAL(15,2) NOT NULL,
    currency_id         INTEGER      NOT NULL REFERENCES ref_currency(id),
    statement_day       INTEGER      NOT NULL,
    due_day             INTEGER      NOT NULL,
    min_payment_percent DECIMAL(5,2) NOT NULL DEFAULT 3.0,
    active              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_credit_card_user_period ON credit_card (user_id, period_id);

-- ----

CREATE TABLE IF NOT EXISTS e_wallet (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    period_id       INTEGER      REFERENCES period(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    provider        VARCHAR(50)  NOT NULL,
    balance         DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency_id     INTEGER      NOT NULL REFERENCES ref_currency(id),
    account_email   VARCHAR(255),
    account_phone   VARCHAR(20),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_e_wallet_user_period ON e_wallet (user_id, period_id);

-- ----

CREATE TABLE IF NOT EXISTS beneficiary (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    iban        VARCHAR(34),
    bank_id     INTEGER      REFERENCES ref_bank(id),
    account_no  VARCHAR(50),
    email       VARCHAR(255),
    phone_number VARCHAR(20),
    description TEXT,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ----

CREATE TABLE IF NOT EXISTS transaction (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    period_id         INTEGER      REFERENCES period(id) ON DELETE CASCADE,
    tx_type_id        INTEGER      NOT NULL REFERENCES ref_tx_type(id),
    category_id       INTEGER      NOT NULL REFERENCES ref_tx_category(id),
    amount            DECIMAL(15,2) NOT NULL,
    currency_id       INTEGER      NOT NULL REFERENCES ref_currency(id),
    payment_method_id INTEGER      NOT NULL REFERENCES ref_payment_method(id),
    transaction_date  DATE         NOT NULL,
    description       TEXT,
    notes             TEXT,
    account_id        INTEGER      REFERENCES account(id) ON DELETE CASCADE,
    credit_card_id    INTEGER      REFERENCES credit_card(id) ON DELETE CASCADE,
    e_wallet_id       INTEGER      REFERENCES e_wallet(id) ON DELETE CASCADE,
    loan_id           INTEGER,
    beneficiary_id    INTEGER      REFERENCES beneficiary(id) ON DELETE CASCADE,
    is_recurring      BOOLEAN      NOT NULL DEFAULT FALSE,
    recurring_type    VARCHAR(20),
    tags              TEXT[]       NOT NULL DEFAULT '{}',
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transaction_user_period     ON transaction (user_id, period_id);
CREATE INDEX IF NOT EXISTS idx_transaction_period_date     ON transaction (period_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_user_date       ON transaction (user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_user_cat_date   ON transaction (user_id, category_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_user_type_date  ON transaction (user_id, tx_type_id, transaction_date);

-- ----

CREATE TABLE IF NOT EXISTS auto_payment (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    period_id         INTEGER      REFERENCES period(id) ON DELETE CASCADE,
    name              VARCHAR(100) NOT NULL,
    amount            DECIMAL(15,2) NOT NULL,
    currency_id       INTEGER      NOT NULL REFERENCES ref_currency(id),
    payment_method_id INTEGER      NOT NULL REFERENCES ref_payment_method(id),
    category_id       INTEGER      NOT NULL REFERENCES ref_tx_category(id),
    cron_schedule     VARCHAR(100) NOT NULL,
    next_payment_date DATE,
    account_id        INTEGER      REFERENCES account(id) ON DELETE CASCADE,
    credit_card_id    INTEGER      REFERENCES credit_card(id) ON DELETE CASCADE,
    e_wallet_id       INTEGER      REFERENCES e_wallet(id) ON DELETE CASCADE,
    beneficiary_id    INTEGER      REFERENCES beneficiary(id) ON DELETE CASCADE,
    description       TEXT,
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auto_payment_user_period ON auto_payment (user_id, period_id);

-- ----

CREATE TABLE IF NOT EXISTS gold_item (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    period_id        INTEGER      REFERENCES period(id) ON DELETE CASCADE,
    name             VARCHAR(100) NOT NULL,
    gold_type_id     INTEGER      NOT NULL REFERENCES ref_gold_type(id),
    gold_purity_id   INTEGER      NOT NULL REFERENCES ref_gold_purity(id),
    weight_grams     DECIMAL(8,3) NOT NULL,
    purchase_price   DECIMAL(15,2) NOT NULL,
    purchase_date    DATE         NOT NULL,
    current_value_try DECIMAL(15,2),
    description      TEXT,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gold_item_user_period ON gold_item (user_id, period_id);

-- ----

CREATE TABLE IF NOT EXISTS investment (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    period_id         INTEGER      REFERENCES period(id) ON DELETE CASCADE,
    name              VARCHAR(200) NOT NULL,
    investment_type   VARCHAR(50)  NOT NULL,
    symbol            VARCHAR(20),
    quantity          DECIMAL(18,8) NOT NULL,
    purchase_price    DECIMAL(15,2) NOT NULL,
    purchase_date     DATE         NOT NULL,
    current_price     DECIMAL(15,2),
    last_price_update TIMESTAMP,
    currency_id       INTEGER      NOT NULL REFERENCES ref_currency(id),
    risk_level        VARCHAR(20)  NOT NULL,
    category          VARCHAR(100),
    notes             TEXT,
    metadata          JSONB                 DEFAULT '{}',
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_investment_user_period_active ON investment (user_id, period_id, active);
CREATE INDEX IF NOT EXISTS idx_investment_type               ON investment (investment_type);

-- ----

CREATE TABLE IF NOT EXISTS loan (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    bank_id                 INTEGER      NOT NULL REFERENCES ref_bank(id),
    name                    VARCHAR(100) NOT NULL,
    loan_type               VARCHAR(50)  NOT NULL,
    total_amount            DECIMAL(15,2) NOT NULL,
    installment_count       INTEGER      NOT NULL,
    remaining_installments  INTEGER      NOT NULL DEFAULT 0,
    interest_rate           DECIMAL(5,2),
    payment_day             INTEGER      NOT NULL,
    currency_id             INTEGER      NOT NULL REFERENCES ref_currency(id),
    start_date              DATE         NOT NULL,
    description             TEXT,
    monthly_payment         DECIMAL(15,2),
    is_fictional            BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_loan_user_active ON loan (user_id, is_active);

ALTER TABLE transaction ADD CONSTRAINT fk_transaction_loan
    FOREIGN KEY (loan_id) REFERENCES loan(id) ON DELETE CASCADE;

-- ----

CREATE TABLE IF NOT EXISTS fx_rate (
    id                SERIAL PRIMARY KEY,
    from_currency_id  INTEGER      NOT NULL REFERENCES ref_currency(id),
    to_currency_id    INTEGER      NOT NULL REFERENCES ref_currency(id),
    rate              DECIMAL(15,6) NOT NULL,
    rate_date         DATE         NOT NULL,
    source            VARCHAR(50)  NOT NULL DEFAULT 'TCMB',
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_fx_rate UNIQUE (from_currency_id, to_currency_id, rate_date)
);

-- ----

CREATE TABLE IF NOT EXISTS portfolio_snapshot (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    snapshot_date     DATE         NOT NULL,
    total_assets      DECIMAL(15,2) NOT NULL,
    total_liabilities DECIMAL(15,2) NOT NULL,
    net_worth         DECIMAL(15,2) NOT NULL,
    breakdown         JSONB        NOT NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_portfolio_snapshot UNIQUE (user_id, snapshot_date)
);

-- ============================================================
-- PLANLAMA & HEDEF TABLOLARI
-- ============================================================

CREATE TABLE IF NOT EXISTS goal (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    target_amount   DECIMAL(15,2) NOT NULL,
    current_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency_id     INTEGER      NOT NULL REFERENCES ref_currency(id),
    target_date     DATE,
    category        VARCHAR(50),
    status          VARCHAR(20)  NOT NULL DEFAULT 'active',
    icon            VARCHAR(50),
    color           VARCHAR(20),
    notes           TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_goal_user_status ON goal (user_id, status);

-- ----

CREATE TABLE IF NOT EXISTS budget_plan (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    period_id       INTEGER      REFERENCES period(id) ON DELETE CASCADE,
    name            VARCHAR(120) NOT NULL DEFAULT 'Varsayilan Butce',
    period_type     VARCHAR(20)  NOT NULL DEFAULT 'monthly',
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    currency_id     INTEGER      NOT NULL REFERENCES ref_currency(id),
    zero_based      BOOLEAN      NOT NULL DEFAULT TRUE,
    rollover_mode   VARCHAR(20)  NOT NULL DEFAULT 'none',
    total_budgeted  DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_budget_plan_user_active_type ON budget_plan (user_id, active, period_type);
CREATE INDEX IF NOT EXISTS idx_budget_plan_user_dates       ON budget_plan (user_id, start_date, end_date);

-- ----

CREATE TABLE IF NOT EXISTS budget_allocation (
    id               SERIAL PRIMARY KEY,
    budget_plan_id   INTEGER      NOT NULL REFERENCES budget_plan(id) ON DELETE CASCADE,
    category_id      INTEGER      NOT NULL REFERENCES ref_tx_category(id),
    amount           DECIMAL(15,2) NOT NULL,
    alert_threshold  DECIMAL(5,2) NOT NULL DEFAULT 80,
    rollover_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_budget_allocation UNIQUE (budget_plan_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_budget_allocation_category ON budget_allocation (category_id);

-- ----

CREATE TABLE IF NOT EXISTS budget_alert (
    id                SERIAL PRIMARY KEY,
    budget_plan_id    INTEGER      NOT NULL REFERENCES budget_plan(id) ON DELETE CASCADE,
    user_id           INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    category_id       INTEGER,
    type              VARCHAR(30)  NOT NULL,
    threshold_percent DECIMAL(5,2),
    actual_amount     DECIMAL(15,2),
    budget_amount     DECIMAL(15,2),
    triggered_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    resolved_at       TIMESTAMP,
    metadata          JSONB                 DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_budget_alert_user_triggered ON budget_alert (user_id, triggered_at);
CREATE INDEX IF NOT EXISTS idx_budget_alert_plan_triggered ON budget_alert (budget_plan_id, triggered_at);

-- ============================================================
-- BİLDİRİM & DESTEK TABLOLARI
-- ============================================================

CREATE TABLE IF NOT EXISTS notification (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    type                VARCHAR(40)  NOT NULL,
    channel             VARCHAR(20)  NOT NULL DEFAULT 'in_app',
    title               VARCHAR(255) NOT NULL,
    body                TEXT         NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'pending',
    priority            VARCHAR(20)  NOT NULL DEFAULT 'normal',
    dedupe_key          VARCHAR(200) UNIQUE,
    payload             JSONB                 DEFAULT '{}',
    scheduled_for       TIMESTAMP,
    delivered_at        TIMESTAMP,
    read_at             TIMESTAMP,
    dismissed_at        TIMESTAMP,
    source_entity_type  VARCHAR(50),
    source_entity_id    VARCHAR(100),
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notification_user_channel_read ON notification (user_id, channel, read_at);
CREATE INDEX IF NOT EXISTS idx_notification_user_status       ON notification (user_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_user_type         ON notification (user_id, type, created_at);

-- ----

CREATE TABLE IF NOT EXISTS push_subscription (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    endpoint    TEXT         NOT NULL UNIQUE,
    p256dh_key  TEXT         NOT NULL,
    auth_key    TEXT         NOT NULL,
    user_agent  VARCHAR(255),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_push_subscription_user_active ON push_subscription (user_id, active);

-- ----

CREATE TABLE IF NOT EXISTS saved_view (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    entity_type VARCHAR(30)  NOT NULL,
    name        VARCHAR(120) NOT NULL,
    description TEXT,
    is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
    is_system   BOOLEAN      NOT NULL DEFAULT FALSE,
    filters     JSONB        NOT NULL DEFAULT '{}',
    sort        JSONB                 DEFAULT '{}',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_saved_view_user_entity_default ON saved_view (user_id, entity_type, is_default);
CREATE INDEX IF NOT EXISTS idx_saved_view_user_entity_system  ON saved_view (user_id, entity_type, is_system);

-- ----

CREATE TABLE IF NOT EXISTS support_ticket_category (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    icon        VARCHAR(50),
    color       VARCHAR(20),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_ticket_category_active ON support_ticket_category (is_active);

-- ----

CREATE TABLE IF NOT EXISTS support_ticket (
    id            SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50)  NOT NULL UNIQUE,
    user_id       INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    category_id   INTEGER      NOT NULL REFERENCES support_ticket_category(id),
    subject       VARCHAR(500) NOT NULL,
    description   TEXT         NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
    priority      VARCHAR(20)  NOT NULL DEFAULT 'medium',
    resolved_at   TIMESTAMP,
    resolved_by   INTEGER,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_ticket_user        ON support_ticket (user_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_status      ON support_ticket (status);
CREATE INDEX IF NOT EXISTS idx_support_ticket_category    ON support_ticket (category_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_number      ON support_ticket (ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_ticket_created     ON support_ticket (created_at);

-- ----

CREATE TABLE IF NOT EXISTS support_ticket_attachment (
    id          SERIAL PRIMARY KEY,
    ticket_id   INTEGER      NOT NULL REFERENCES support_ticket(id) ON DELETE CASCADE,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    file_size   INTEGER      NOT NULL,
    mime_type   VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_ticket_attachment_ticket ON support_ticket_attachment (ticket_id);

-- ----

CREATE TABLE IF NOT EXISTS support_ticket_reply (
    id          SERIAL PRIMARY KEY,
    ticket_id   INTEGER      NOT NULL REFERENCES support_ticket(id) ON DELETE CASCADE,
    user_id     INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    message     TEXT         NOT NULL,
    is_internal BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_support_ticket_reply_ticket  ON support_ticket_reply (ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_reply_user    ON support_ticket_reply (user_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_reply_created ON support_ticket_reply (created_at);

-- ----

CREATE TABLE IF NOT EXISTS feedback (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    type          VARCHAR(20)  NOT NULL,
    subject       VARCHAR(200),
    message       TEXT         NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
    reply_message TEXT,
    replied_at    TIMESTAMP,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feedback_status  ON feedback (status);
CREATE INDEX IF NOT EXISTS idx_feedback_type    ON feedback (type);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at);

-- ----

CREATE TABLE IF NOT EXISTS faq (
    id            SERIAL PRIMARY KEY,
    question      VARCHAR(500) NOT NULL,
    answer        TEXT         NOT NULL,
    category      VARCHAR(100),
    display_order INTEGER      NOT NULL DEFAULT 0,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faq_active_order ON faq (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_faq_category     ON faq (category);

-- ============================================================
-- AI & RAPORLAMA TABLOLARI
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_report_usage (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    report_type   VARCHAR(50)  NOT NULL,
    report_date   TIMESTAMP    NOT NULL,
    month_year    VARCHAR(7)   NOT NULL,
    report_data   JSONB        NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'processing',
    error_message TEXT,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_report_usage_user_month ON ai_report_usage (user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_ai_report_usage_user_date  ON ai_report_usage (user_id, report_date);
CREATE INDEX IF NOT EXISTS idx_ai_report_usage_status     ON ai_report_usage (status);

-- ============================================================
-- _prisma_migrations tablosu (Prisma metadata)
-- ============================================================

CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id                      VARCHAR(36)  NOT NULL PRIMARY KEY,
    checksum                VARCHAR(64)  NOT NULL,
    finished_at             TIMESTAMP,
    migration_name          VARCHAR(255) NOT NULL,
    logs                    TEXT,
    rolled_back_at          TIMESTAMP,
    started_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    applied_steps_count     INTEGER      NOT NULL DEFAULT 0
);

-- ============================================================
-- BİTİŞ
-- ============================================================
-- Tüm tablolar oluşturuldu.
-- Sonraki adım: npx prisma db seed veya npm run db:seed
-- ============================================================
