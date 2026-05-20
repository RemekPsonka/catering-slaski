-- =============================================
-- Catering Śląski — PostgreSQL init script
-- Uruchamiany automatycznie przy pierwszym `docker compose up`
-- (via /docker-entrypoint-initdb.d/)
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================
-- Catering Śląski schema isolation
-- Catering tables go to "cs" schema
-- Strefa Lunch keeps "public.sl_*"
-- =====================================
CREATE SCHEMA IF NOT EXISTS cs;

-- Set search_path for this session
SET search_path TO cs, public;

-- Verify PostGIS works
DO $$
BEGIN
    RAISE NOTICE 'PostGIS version: %', PostGIS_Version();
END $$;

-- ==========================================
-- Custom schema (poza Medusa core)
-- Medusa zarządza swoimi tabelami sam.
-- Te niżej są CUSTOM, ale w tym samym DB.
-- ==========================================

-- ENUMs
DO $$ BEGIN
    CREATE TYPE zone_type_enum AS ENUM ('local', 'regional', 'national');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE delivery_method_enum AS ENUM ('own_fleet', 'courier_dpd', 'courier_inpost', 'pickup_only');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE slot_status_enum AS ENUM ('open', 'full', 'blocked', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status_enum AS ENUM ('pending', 'confirmed', 'expired', 'released');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE catering_category_enum AS ENUM ('hot_meals', 'catering_boxes', 'diet_meals', 'bundles', 'event_special', 'subscription');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE packaging_type_enum AS ENUM ('thermal', 'wooden_box', 'diet_container', 'cake_box', 'mixed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE temperature_enum AS ENUM ('hot', 'cold', 'room_temp', 'frozen');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sub_frequency_enum AS ENUM ('weekly', 'bi_weekly', 'monthly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE sub_status_enum AS ENUM ('active', 'paused', 'canceled', 'past_due');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE loyalty_tier_enum AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE referral_status_enum AS ENUM ('pending', 'paid', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE webhook_status_enum AS ENUM ('queued', 'delivered', 'failed_retry', 'dead_letter');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- DELIVERY ZONES
-- ==========================================
CREATE TABLE IF NOT EXISTS cs.delivery_zones (
  id              text PRIMARY KEY DEFAULT 'dz_' || gen_random_uuid()::text,
  name            varchar(120) NOT NULL,
  slug            varchar(120) UNIQUE NOT NULL,
  zone_type       zone_type_enum NOT NULL,
  delivery_method delivery_method_enum NOT NULL,
  polygon         geometry(MultiPolygon, 4326) NOT NULL,
  base_delivery_fee_cents int NOT NULL DEFAULT 0,
  free_delivery_threshold_cents int NULL,
  min_order_cents int NOT NULL DEFAULT 0,
  lead_time_days  int NOT NULL DEFAULT 0,
  cutoff_hour     int NOT NULL DEFAULT 18,
  cutoff_minute   int NOT NULL DEFAULT 0,
  allowed_product_categories text[] NOT NULL DEFAULT ARRAY['catering_boxes'],
  max_transport_hours int NULL,
  priority        int NOT NULL DEFAULT 100,
  is_active       boolean NOT NULL DEFAULT true,
  display_color   varchar(7) DEFAULT '#E54B17',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_polygon ON cs.delivery_zones USING GIST (polygon);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON cs.delivery_zones (is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_delivery_zones_priority ON cs.delivery_zones (priority DESC) WHERE is_active = true;

-- ==========================================
-- TIME SLOTS + RESERVATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS cs.delivery_time_slots (
  id                text PRIMARY KEY DEFAULT 'ts_' || gen_random_uuid()::text,
  delivery_zone_id  text NOT NULL REFERENCES cs.delivery_zones(id) ON DELETE CASCADE,
  slot_date         date NOT NULL,
  time_from         time NOT NULL,
  time_to           time NOT NULL,
  capacity          int NOT NULL,
  booked_count      int NOT NULL DEFAULT 0,
  status            slot_status_enum NOT NULL DEFAULT 'open',
  admin_note        text NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT slot_capacity_positive CHECK (capacity >= 0),
  CONSTRAINT slot_booked_lte_capacity CHECK (booked_count <= capacity),
  CONSTRAINT slot_time_order CHECK (time_to > time_from),
  CONSTRAINT slot_unique UNIQUE (delivery_zone_id, slot_date, time_from)
);

CREATE INDEX IF NOT EXISTS idx_slots_zone_date ON cs.delivery_time_slots (delivery_zone_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_slots_open ON cs.delivery_time_slots (status, slot_date) WHERE status = 'open';

CREATE TABLE IF NOT EXISTS cs.slot_reservations (
  id              text PRIMARY KEY DEFAULT 'rs_' || gen_random_uuid()::text,
  time_slot_id    text NOT NULL REFERENCES cs.delivery_time_slots(id) ON DELETE CASCADE,
  cart_id         text NOT NULL,
  order_id        text NULL,
  status          reservation_status_enum NOT NULL DEFAULT 'pending',
  reserved_at     timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL,
  confirmed_at    timestamptz NULL,
  released_at     timestamptz NULL,
  CONSTRAINT res_unique_per_cart UNIQUE (cart_id, time_slot_id)
);

CREATE INDEX IF NOT EXISTS idx_reservations_expires ON cs.slot_reservations (expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reservations_order ON cs.slot_reservations (order_id);

-- ==========================================
-- PRODUCT CATERING ATTRIBUTES
-- ==========================================
CREATE TABLE IF NOT EXISTS cs.product_catering_attributes (
  product_id              text PRIMARY KEY,
  category                catering_category_enum NOT NULL,
  production_lead_time_days int NOT NULL DEFAULT 1,
  cutoff_override_hour    int NULL,
  packaging_type          packaging_type_enum NOT NULL,
  shelf_life_hours        int NOT NULL DEFAULT 48,
  temperature_constraint  temperature_enum NOT NULL DEFAULT 'room_temp',
  transport_max_hours     int NULL,
  portions_default        int NOT NULL DEFAULT 10,
  portions_min            int NOT NULL DEFAULT 1,
  portions_max            int NULL,
  diet_tags               text[] NOT NULL DEFAULT '{}',
  allergens               text[] NOT NULL DEFAULT '{}',
  can_be_subscribed       boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pca_category ON cs.product_catering_attributes (category);
CREATE INDEX IF NOT EXISTS idx_pca_diet_tags ON cs.product_catering_attributes USING GIN (diet_tags);

CREATE TABLE IF NOT EXISTS cs.product_zone_availability (
  product_id              text NOT NULL,
  delivery_zone_id        text NOT NULL REFERENCES cs.delivery_zones(id) ON DELETE CASCADE,
  is_available            boolean NOT NULL DEFAULT true,
  custom_lead_time_days   int NULL,
  price_override_cents    int NULL,
  PRIMARY KEY (product_id, delivery_zone_id)
);

CREATE INDEX IF NOT EXISTS idx_pza_zone ON cs.product_zone_availability (delivery_zone_id) WHERE is_available = true;

-- ==========================================
-- ORDER CATERING METADATA
-- ==========================================
CREATE TABLE IF NOT EXISTS cs.order_catering_metadata (
  order_id              text PRIMARY KEY,
  delivery_zone_id      text NOT NULL REFERENCES cs.delivery_zones(id),
  time_slot_id          text NOT NULL REFERENCES cs.delivery_time_slots(id),
  delivery_address_lat  decimal(10, 7) NOT NULL,
  delivery_address_lng  decimal(10, 7) NOT NULL,
  delivery_instructions text NULL,
  requires_invoice      boolean NOT NULL DEFAULT false,
  invoice_nip           varchar(20) NULL,
  invoice_company_name  varchar(200) NULL,
  source                varchar(50) NOT NULL DEFAULT 'storefront',
  ai_brief              text NULL,
  referral_code         varchar(40) NULL,
  production_status     varchar(50) NULL,
  delivery_status       varchar(50) NULL,
  courier_tracking_number varchar(100) NULL,
  subscription_id       text NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ocm_zone ON cs.order_catering_metadata (delivery_zone_id);
CREATE INDEX IF NOT EXISTS idx_ocm_slot ON cs.order_catering_metadata (time_slot_id);
CREATE INDEX IF NOT EXISTS idx_ocm_subscription ON cs.order_catering_metadata (subscription_id);

-- ==========================================
-- SUBSCRIPTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS cs.subscriptions (
  id                    text PRIMARY KEY DEFAULT 'sub_' || gen_random_uuid()::text,
  customer_id           text NOT NULL,
  name                  varchar(200) NOT NULL,
  product_set           jsonb NOT NULL,
  rotation_pool         jsonb NULL,
  excluded_products     text[] NOT NULL DEFAULT '{}',
  frequency             sub_frequency_enum NOT NULL,
  delivery_day_of_week  int NULL CHECK (delivery_day_of_week BETWEEN 1 AND 7),
  delivery_zone_id      text NOT NULL REFERENCES cs.delivery_zones(id),
  preferred_slot_time   time NULL,
  delivery_address      jsonb NOT NULL,
  stripe_subscription_id varchar(100) NULL,
  stripe_customer_id     varchar(100) NULL,
  status                sub_status_enum NOT NULL DEFAULT 'active',
  start_date            date NOT NULL,
  next_delivery_date    date NOT NULL,
  paused_until          date NULL,
  canceled_at           timestamptz NULL,
  cycle_price_cents     int NOT NULL,
  total_paid_cents      int NOT NULL DEFAULT 0,
  total_deliveries      int NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_customer ON cs.subscriptions (customer_id);
CREATE INDEX IF NOT EXISTS idx_sub_next_delivery ON cs.subscriptions (next_delivery_date) WHERE status = 'active';

-- ==========================================
-- LOYALTY
-- ==========================================
CREATE TABLE IF NOT EXISTS cs.customer_loyalty_state (
  customer_id              text PRIMARY KEY,
  current_tier             loyalty_tier_enum NOT NULL DEFAULT 'bronze',
  lifetime_orders_count    int NOT NULL DEFAULT 0,
  lifetime_spent_cents     bigint NOT NULL DEFAULT 0,
  rolling_12m_orders_count int NOT NULL DEFAULT 0,
  rolling_12m_spent_cents  bigint NOT NULL DEFAULT 0,
  points_balance           int NOT NULL DEFAULT 0,
  tier_attained_at         timestamptz NULL,
  last_recalculated_at     timestamptz NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- REFERRAL
-- ==========================================
CREATE TABLE IF NOT EXISTS cs.referral_codes (
  code                  varchar(40) PRIMARY KEY,
  referrer_customer_id  text NOT NULL,
  is_active             boolean NOT NULL DEFAULT true,
  total_referrals       int NOT NULL DEFAULT 0,
  total_payouts_cents   bigint NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_referrer ON cs.referral_codes (referrer_customer_id);

CREATE TABLE IF NOT EXISTS cs.referral_redemptions (
  id                              text PRIMARY KEY DEFAULT 'rfr_' || gen_random_uuid()::text,
  code                            varchar(40) NOT NULL REFERENCES cs.referral_codes(code),
  referred_customer_id            text NOT NULL,
  order_id                        text NOT NULL,
  referrer_credit_amount_cents    int NOT NULL,
  referred_discount_amount_cents  int NOT NULL,
  status                          referral_status_enum NOT NULL DEFAULT 'pending',
  created_at                      timestamptz NOT NULL DEFAULT now()
);

-- ==========================================
-- CUSTOMER PREFERENCES + FAVORITES
-- ==========================================
CREATE TABLE IF NOT EXISTS cs.customer_preferences (
  customer_id           text PRIMARY KEY,
  diet                  text[] NOT NULL DEFAULT '{}',
  allergens_avoid       text[] NOT NULL DEFAULT '{}',
  dislikes              text[] NOT NULL DEFAULT '{}',
  favorite_cuisines     text[] NOT NULL DEFAULT '{}',
  default_portions      int NULL,
  default_zone_id       text NULL REFERENCES cs.delivery_zones(id),
  marketing_consent     boolean NOT NULL DEFAULT false,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cs.customer_favorites (
  customer_id   text NOT NULL,
  product_id    text NOT NULL,
  added_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, product_id)
);

-- ==========================================
-- WEBHOOK DISPATCH + DLQ
-- ==========================================
CREATE TABLE IF NOT EXISTS cs.webhook_deliveries (
  id              text PRIMARY KEY DEFAULT 'wh_' || gen_random_uuid()::text,
  event_id        text NOT NULL UNIQUE,
  destination     varchar(50) NOT NULL,
  event_type      varchar(80) NOT NULL,
  endpoint_url    text NOT NULL,
  payload_json    jsonb NOT NULL,
  status          webhook_status_enum NOT NULL DEFAULT 'queued',
  attempts        int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz NULL,
  delivered_at    timestamptz NULL,
  last_status_code int NULL,
  last_error      text NULL,
  next_retry_at   timestamptz NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wh_status ON cs.webhook_deliveries (status);
CREATE INDEX IF NOT EXISTS idx_wh_next_retry ON cs.webhook_deliveries (next_retry_at) WHERE status = 'failed_retry';
CREATE INDEX IF NOT EXISTS idx_wh_event ON cs.webhook_deliveries (event_id);

CREATE TABLE IF NOT EXISTS cs.webhook_dead_letters (
  id              text PRIMARY KEY DEFAULT 'wdl_' || gen_random_uuid()::text,
  webhook_delivery_id text NOT NULL REFERENCES cs.webhook_deliveries(id),
  destination     varchar(50) NOT NULL,
  payload_json    jsonb NOT NULL,
  last_error      text NULL,
  attempts        int NOT NULL,
  resolved_at     timestamptz NULL,
  resolved_by_user_id text NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cs.incoming_webhook_log (
  event_id        text PRIMARY KEY,
  source          varchar(50) NOT NULL,
  event_type      varchar(80) NOT NULL,
  payload_json    jsonb NOT NULL,
  received_at     timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz NULL,
  result          varchar(20) NULL
);

-- ==========================================
-- UPDATED_AT TRIGGER (universal)
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'delivery_zones', 'delivery_time_slots',
    'product_catering_attributes', 'order_catering_metadata',
    'subscriptions', 'customer_loyalty_state',
    'customer_preferences'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON cs.%I;
      CREATE TRIGGER trg_updated_at
      BEFORE UPDATE ON cs.%I
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', t, t);
  END LOOP;
END $$;

-- ==========================================
-- DIAGNOSTIC VIEWS
-- ==========================================
CREATE OR REPLACE VIEW cs.v_active_zones AS
SELECT
  id, name, slug, zone_type, delivery_method,
  base_delivery_fee_cents / 100.0 AS delivery_fee_pln,
  lead_time_days, cutoff_hour, priority,
  ST_Area(polygon::geography) / 1000000.0 AS area_km2
FROM cs.delivery_zones
WHERE is_active = true AND deleted_at IS NULL
ORDER BY priority DESC;

CREATE OR REPLACE VIEW cs.v_slots_today AS
SELECT
  ts.id, ts.slot_date, ts.time_from, ts.time_to,
  ts.capacity, ts.booked_count,
  (ts.capacity - ts.booked_count) AS available,
  dz.name AS zone_name,
  ts.status
FROM cs.delivery_time_slots ts
JOIN cs.delivery_zones dz ON dz.id = ts.delivery_zone_id
WHERE ts.slot_date = CURRENT_DATE
ORDER BY dz.priority DESC, ts.time_from;

CREATE OR REPLACE VIEW cs.v_webhook_health AS
SELECT
  destination,
  status,
  COUNT(*) AS count,
  MAX(created_at) AS last_event,
  AVG(attempts) AS avg_attempts
FROM cs.webhook_deliveries
WHERE created_at > now() - INTERVAL '24 hours'
GROUP BY destination, status
ORDER BY destination, status;

-- ==========================================
-- DONE
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✓ Catering Śląski DB initialized successfully';
  RAISE NOTICE '  Custom tables: 14';
  RAISE NOTICE '  Views: 3';
  RAISE NOTICE '  PostGIS: %', PostGIS_Version();
  RAISE NOTICE 'Next: run Medusa migrations to add core schema';
END $$;
