-- Run this once to set up the database

CREATE TABLE IF NOT EXISTS users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(50)  NOT NULL,
  color VARCHAR(7)   NOT NULL,
  icon  VARCHAR(10)  NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(100)   NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  date        DATE           NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Default categories
INSERT INTO categories (name, color, icon) VALUES
  ('Food & Drink',  '#E53935', '🍔'),
  ('Transport',     '#F57C00', '🚗'),
  ('Housing',       '#388E3C', '🏠'),
  ('Shopping',      '#7B1FA2', '🛍'),
  ('Entertainment', '#0288D1', '🎮'),
  ('Health',        '#00838F', '💊')
ON CONFLICT DO NOTHING;

-- Test account  (change name/email/password to whatever you want)
INSERT INTO users (name, email, password) VALUES
  ('Pema Losel', 'pema@test.com', 'test1234')
ON CONFLICT (email) DO NOTHING;
