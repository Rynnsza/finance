-- Add investment and liability to account types
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_type_check;
ALTER TABLE accounts ADD CONSTRAINT accounts_type_check CHECK (type IN ('bank', 'e-wallet', 'cash', 'investment', 'liability'));
