-- ============================================================================
-- cs.webhook_events_in — inbound webhook events from external systems
-- Used by:
--   /hooks/external/production  (source = 'production')
--   /hooks/external/logistics   (source = 'logistics')
--   /hooks/external/billing     (source = 'billing')
--
-- Idempotency: event_id + source UNIQUE — duplicates rejected at insert.
-- ============================================================================

CREATE TABLE IF NOT EXISTS cs.webhook_events_in (
  id           BIGSERIAL PRIMARY KEY,
  event_id     TEXT NOT NULL,
  source       TEXT NOT NULL
               CHECK (source IN ('production', 'logistics', 'billing')),
  order_id     TEXT,
  status       TEXT NOT NULL,
  payload      JSONB NOT NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (event_id, source)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_in_order
  ON cs.webhook_events_in (order_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_in_source_status
  ON cs.webhook_events_in (source, status, received_at DESC);

-- Helpful view: latest event per order per source (for status dashboards)
CREATE OR REPLACE VIEW cs.v_order_latest_external_status AS
SELECT DISTINCT ON (order_id, source)
  order_id,
  source,
  status,
  received_at,
  payload
FROM cs.webhook_events_in
WHERE order_id IS NOT NULL
ORDER BY order_id, source, received_at DESC;
