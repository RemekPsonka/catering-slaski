-- ============================================================================
-- Migration: cs.product_attributes, cs.subscriptions, cs.loyalty_*
-- Adds backing tables for catering-attributes, subscriptions, loyalty modules
-- ============================================================================

SET search_path TO cs, public;

-- ============================================================================
-- product_attributes — catering-specific metadata for Medusa products
-- ============================================================================
CREATE TABLE IF NOT EXISTS cs.product_attributes (
  id              TEXT PRIMARY KEY,
  product_id      TEXT NOT NULL UNIQUE,

  portions_min    INTEGER,
  portions_max    INTEGER,
  portions_label  TEXT,

  is_vegetarian   BOOLEAN NOT NULL DEFAULT false,
  is_vegan        BOOLEAN NOT NULL DEFAULT false,
  is_gluten_free  BOOLEAN NOT NULL DEFAULT false,
  is_lactose_free BOOLEAN NOT NULL DEFAULT false,
  is_spicy        BOOLEAN NOT NULL DEFAULT false,
  is_bestseller   BOOLEAN NOT NULL DEFAULT false,
  is_new          BOOLEAN NOT NULL DEFAULT false,

  allergens       JSONB,
  contents        JSONB,
  kcal_per_portion INTEGER,
  min_lead_hours  INTEGER NOT NULL DEFAULT 24,
  occasion_tags   JSONB,
  season_tags     JSONB,
  cross_sell_ids  JSONB,

  short_description TEXT,
  rating_avg      NUMERIC(2,1),
  rating_count    INTEGER NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_attrs_diet
  ON cs.product_attributes (is_vegetarian, is_vegan, is_gluten_free);
CREATE INDEX IF NOT EXISTS idx_product_attrs_bestseller
  ON cs.product_attributes (is_bestseller) WHERE is_bestseller = true;
CREATE INDEX IF NOT EXISTS idx_product_attrs_occasion
  ON cs.product_attributes USING GIN (occasion_tags);

-- ============================================================================
-- subscriptions — recurring lunch/box delivery commitments
-- ============================================================================
CREATE TABLE IF NOT EXISTS cs.subscriptions (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL,

  plan_code       TEXT NOT NULL,
  plan_name       TEXT NOT NULL,

  frequency       TEXT NOT NULL DEFAULT 'weekly'
                  CHECK (frequency IN ('daily','weekly','biweekly','monthly')),
  weekdays        JSONB,
  delivery_time_slot TEXT,

  price_cents_per_period INTEGER NOT NULL,
  discount_pct    INTEGER NOT NULL DEFAULT 15,

  items           JSONB NOT NULL,
  address_snapshot JSONB NOT NULL,
  delivery_zone_id TEXT,

  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','paused','cancelled')),
  paused_until    TIMESTAMPTZ,
  started_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ,
  next_run_at     TIMESTAMPTZ NOT NULL,
  last_run_at     TIMESTAMPTZ,

  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer
  ON cs.subscriptions (customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_due
  ON cs.subscriptions (status, next_run_at) WHERE status = 'active';

-- ============================================================================
-- loyalty_accounts — per-customer points balance
-- ============================================================================
CREATE TABLE IF NOT EXISTS cs.loyalty_accounts (
  id                  TEXT PRIMARY KEY,
  customer_id         TEXT NOT NULL UNIQUE,

  points_balance      INTEGER NOT NULL DEFAULT 0,
  points_lifetime     INTEGER NOT NULL DEFAULT 0,

  tier                TEXT NOT NULL DEFAULT 'brąz'
                      CHECK (tier IN ('brąz','srebro','złoto','diament')),
  tier_progress_pct   INTEGER NOT NULL DEFAULT 0,

  referral_code       TEXT UNIQUE,
  referred_by_customer_id TEXT,

  last_activity_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_referral
  ON cs.loyalty_accounts (referral_code) WHERE referral_code IS NOT NULL;

-- ============================================================================
-- loyalty_transactions — append-only points ledger
-- ============================================================================
CREATE TABLE IF NOT EXISTS cs.loyalty_transactions (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL,

  points_delta    INTEGER NOT NULL,
  reason          TEXT NOT NULL
                  CHECK (reason IN ('order_earn','redeem','referral_bonus','manual_adjust','expired')),
  order_id        TEXT,
  note            TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_tx_customer
  ON cs.loyalty_transactions (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_idempotency
  ON cs.loyalty_transactions (customer_id, order_id, reason)
  WHERE order_id IS NOT NULL;

-- ============================================================================
-- updated_at trigger reused from init migration
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    CREATE OR REPLACE FUNCTION cs.set_updated_at() RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END$$;

CREATE TRIGGER trg_product_attrs_updated
  BEFORE UPDATE ON cs.product_attributes
  FOR EACH ROW EXECUTE FUNCTION cs.set_updated_at();

CREATE TRIGGER trg_subscriptions_updated
  BEFORE UPDATE ON cs.subscriptions
  FOR EACH ROW EXECUTE FUNCTION cs.set_updated_at();

CREATE TRIGGER trg_loyalty_accounts_updated
  BEFORE UPDATE ON cs.loyalty_accounts
  FOR EACH ROW EXECUTE FUNCTION cs.set_updated_at();

-- ============================================================================
-- Helpful views for admin reporting
-- ============================================================================
CREATE OR REPLACE VIEW cs.v_loyalty_summary AS
SELECT
  tier,
  COUNT(*) AS customer_count,
  SUM(points_balance) AS total_outstanding_points,
  AVG(points_lifetime)::INT AS avg_lifetime_points
FROM cs.loyalty_accounts
GROUP BY tier;

CREATE OR REPLACE VIEW cs.v_subscriptions_due_24h AS
SELECT
  id,
  customer_id,
  plan_name,
  next_run_at,
  EXTRACT(EPOCH FROM (next_run_at - NOW())) / 3600 AS hours_until_run
FROM cs.subscriptions
WHERE status = 'active'
  AND next_run_at <= NOW() + INTERVAL '24 hours'
ORDER BY next_run_at;
