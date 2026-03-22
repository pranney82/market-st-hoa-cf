-- Market St HOA - D1 Schema Migration
-- Generated from shared/schema.ts

CREATE TABLE IF NOT EXISTS households (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  unit_number TEXT,
  primary_contact_id TEXT,
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  moving_status TEXT,
  moving_date TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS households_address_unit_idx ON households(address, unit_number);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  role TEXT NOT NULL DEFAULT 'homeowner',
  position TEXT,
  unit_number TEXT,
  address TEXT,
  phone_number TEXT,
  emergency_contact TEXT,
  spouse_partner_name TEXT,
  spouse_partner_phone TEXT,
  spouse_partner_email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_is_spouse INTEGER DEFAULT 0,
  kids TEXT,
  pets TEXT,
  local_password_hash TEXT,
  email_notifications INTEGER DEFAULT 1,
  announcement_notifications INTEGER DEFAULT 1,
  event_notifications INTEGER DEFAULT 1,
  autopay_enabled INTEGER DEFAULT 0,
  autopay_method TEXT,
  autopay_card_token TEXT,
  autopay_card_last4 TEXT,
  autopay_card_type TEXT,
  autopay_card_expiry TEXT,
  autopay_bank_token TEXT,
  autopay_bank_last4 TEXT,
  autopay_bank_name TEXT,
  autopay_bank_type TEXT,
  household_id TEXT REFERENCES households(id) ON DELETE SET NULL,
  moving_status TEXT,
  moving_date TEXT,
  member_status TEXT NOT NULL DEFAULT 'active',
  departed_at TEXT,
  departure_notes TEXT,
  profile_completed INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TEXT NOT NULL,
  created_at TEXT,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT,
  description TEXT,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_public INTEGER DEFAULT 0,
  version TEXT DEFAULT '1',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date_time TEXT NOT NULL,
  end_date_time TEXT,
  location TEXT NOT NULL,
  max_capacity TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'attending',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS architectural_requests (
  id TEXT PRIMARY KEY,
  request_type TEXT NOT NULL DEFAULT 'architectural',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  household_id TEXT REFERENCES households(id) ON DELETE CASCADE,
  submitted_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  review_notes TEXT,
  attachment_urls TEXT,
  created_at TEXT,
  updated_at TEXT,
  reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS request_comments (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES architectural_requests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS request_votes (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES architectural_requests(id) ON DELETE CASCADE,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote TEXT NOT NULL,
  created_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS request_votes_household_request_idx ON request_votes(request_id, household_id);

CREATE TABLE IF NOT EXISTS dues_payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL,
  amount TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TEXT NOT NULL,
  paid_date TEXT,
  helcim_transaction_id TEXT,
  autopay_attempted_at TEXT,
  autopay_status TEXT,
  autopay_failure_reason TEXT,
  notes TEXT,
  description TEXT,
  image_url TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_status_autopay ON dues_payments(status, autopay_status);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id TEXT REFERENCES households(id) ON DELETE SET NULL,
  amount TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  helcim_transaction_id TEXT NOT NULL UNIQUE,
  last4 TEXT,
  card_type TEXT,
  bank_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  settled_at TEXT,
  failure_reason TEXT,
  applied_amount TEXT DEFAULT '0',
  unapplied_amount TEXT,
  source TEXT NOT NULL DEFAULT 'online',
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS payment_applications (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  dues_payment_id TEXT NOT NULL REFERENCES dues_payments(id) ON DELETE CASCADE,
  amount TEXT NOT NULL,
  applied_at TEXT
);

CREATE TABLE IF NOT EXISTS bylaws (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  is_current INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS account_categories (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  parent_id TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  amount TEXT NOT NULL,
  type TEXT NOT NULL,
  category_id TEXT REFERENCES account_categories(id),
  reference TEXT,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES account_categories(id),
  year INTEGER NOT NULL,
  month INTEGER,
  budgeted_amount TEXT NOT NULL,
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS reconciliations (
  id TEXT PRIMARY KEY,
  reconciliation_date TEXT NOT NULL,
  starting_balance TEXT NOT NULL,
  ending_balance TEXT NOT NULL,
  cleared_balance TEXT NOT NULL,
  difference_amount TEXT,
  is_balanced INTEGER DEFAULT 0,
  reconciled_by TEXT NOT NULL,
  notes TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS transaction_codings (
  id TEXT PRIMARY KEY,
  mercury_transaction_id TEXT NOT NULL UNIQUE,
  category_id TEXT REFERENCES account_categories(id),
  status TEXT DEFAULT 'coded',
  notes TEXT,
  coded_by TEXT REFERENCES users(id),
  coded_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS ballots (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ballot_type TEXT NOT NULL DEFAULT 'yes_no',
  status TEXT NOT NULL DEFAULT 'draft',
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  show_results_before_close INTEGER DEFAULT 0,
  requires_quorum INTEGER DEFAULT 1,
  quorum_percentage INTEGER DEFAULT 50,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS ballot_options (
  id TEXT PRIMARY KEY,
  ballot_id TEXT NOT NULL REFERENCES ballots(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS household_votes (
  id TEXT PRIMARY KEY,
  ballot_id TEXT NOT NULL REFERENCES ballots(id) ON DELETE CASCADE,
  household_id TEXT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL REFERENCES ballot_options(id) ON DELETE CASCADE,
  voted_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS household_votes_ballot_household_idx ON household_votes(ballot_id, household_id);

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT
);

-- Seed default monthly dues amount
INSERT OR IGNORE INTO system_settings (id, key, value, updated_at)
VALUES ('default-dues', 'monthly_dues_amount', '150', datetime('now'));
