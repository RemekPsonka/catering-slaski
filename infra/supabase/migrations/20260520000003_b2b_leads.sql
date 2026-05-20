-- ============================================================================
-- cs.b2b_leads — submissions from the /dla-firm event brief form
-- ============================================================================

CREATE TABLE IF NOT EXISTS cs.b2b_leads (
  id                      TEXT PRIMARY KEY,

  occasion                TEXT NOT NULL,
  event_date              DATE,
  guests                  INTEGER NOT NULL,
  budget_per_person_cents INTEGER NOT NULL,
  total_budget_cents      INTEGER NOT NULL,
  format                  TEXT NOT NULL
                          CHECK (format IN ('finger_food','dinner','buffet','lunch_box')),
  diet_split              JSONB NOT NULL,

  company_name            TEXT,
  nip                     TEXT,
  contact_name            TEXT NOT NULL,
  email                   TEXT NOT NULL,
  phone                   TEXT NOT NULL,
  city                    TEXT,
  notes                   TEXT,

  source                  TEXT NOT NULL DEFAULT 'b2b_form',
  status                  TEXT NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new','contacted','quoted','won','lost')),
  assigned_to             TEXT,
  quoted_at               TIMESTAMPTZ,
  won_at                  TIMESTAMPTZ,
  order_id                TEXT,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_leads_status
  ON cs.b2b_leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_email
  ON cs.b2b_leads (email);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_event_date
  ON cs.b2b_leads (event_date) WHERE event_date IS NOT NULL;

CREATE TRIGGER trg_b2b_leads_updated
  BEFORE UPDATE ON cs.b2b_leads
  FOR EACH ROW EXECUTE FUNCTION cs.set_updated_at();

-- Convenience view: open leads by deadline urgency
CREATE OR REPLACE VIEW cs.v_b2b_leads_pipeline AS
SELECT
  id, occasion, event_date, guests,
  total_budget_cents / 100 AS total_budget_pln,
  contact_name, company_name, email, phone, city,
  status, assigned_to,
  EXTRACT(DAY FROM (event_date::TIMESTAMP - NOW())) AS days_until_event,
  created_at
FROM cs.b2b_leads
WHERE status NOT IN ('won', 'lost')
ORDER BY event_date NULLS LAST, created_at DESC;
