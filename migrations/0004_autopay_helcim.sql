-- Add Helcim recurring billing fields to users
ALTER TABLE users ADD COLUMN helcim_customer_code TEXT;
ALTER TABLE users ADD COLUMN helcim_subscription_id INTEGER;
