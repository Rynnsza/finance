-- Create accounts table
CREATE TABLE accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('bank', 'e-wallet', 'cash')),
  currency text DEFAULT 'IDR',
  color text DEFAULT '#3b82f6',
  icon text DEFAULT 'hugeicons:bank',
  initial_balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION on_accounts_updated()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_accounts_updated
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION on_accounts_updated();

-- Add account_id to transactions
ALTER TABLE transactions ADD COLUMN account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_select_own_accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT partner_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "users_can_insert_own_accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);
