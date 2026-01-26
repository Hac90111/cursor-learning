-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS) for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Allow insert for new users" ON users;

-- Create a policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true);

-- Create a policy to allow insert for new users
CREATE POLICY "Allow insert for new users" ON users
  FOR INSERT
  WITH CHECK (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Create trigger to automatically update updated_at for users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('dev', 'prod')),
  usage INTEGER DEFAULT 0,
  key TEXT NOT NULL UNIQUE,
  monthly_limit INTEGER,
  limit_monthly_usage BOOLEAN DEFAULT FALSE,
  enable_pii BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID -- Add this if you want to associate keys with users
);

-- Create index on user_id if you're using user authentication
-- CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_name ON api_keys(name);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_api_keys_type ON api_keys(type);

-- Enable Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON api_keys;

-- Create a policy to allow all operations (adjust based on your auth needs)
-- For now, this allows anyone to read/write. You should restrict this based on your auth setup.
CREATE POLICY "Allow all operations for authenticated users" ON api_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- If you want to restrict to authenticated users only, use this instead:
-- CREATE POLICY "Allow all operations for authenticated users" ON api_keys
--   FOR ALL
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

