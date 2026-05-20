-- Stripe event log dla idempotency
-- Każdy Stripe webhook event ma unikalne ID — używamy do dedupe
CREATE TABLE IF NOT EXISTS stripe_event_log (
  event_id        text PRIMARY KEY,
  event_type      varchar(80) NOT NULL,
  payload         jsonb NOT NULL,
  received_at     timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz NULL,
  result          varchar(20) NULL,  -- 'success', 'error'
  error_message   text NULL
);

CREATE INDEX IF NOT EXISTS idx_stripe_event_type ON stripe_event_log (event_type, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_event_unprocessed ON stripe_event_log (received_at)
  WHERE processed_at IS NULL;

-- Cleanup: keep last 90 days
-- Cron: 0 4 * * * DELETE FROM stripe_event_log WHERE received_at < now() - INTERVAL '90 days';
