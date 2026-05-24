require('dotenv').config();
const { Client } = require('pg');

const DB_NAME = 'personal_tracker';

// Connect to default 'postgres' database first to create our DB
const adminUrl = process.env.DATABASE_URL.replace(`/${DB_NAME}`, '/postgres');

async function run() {
  // Step 1: create the database if it doesn't exist
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();
  const exists = await admin.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
  if (exists.rows.length === 0) {
    await admin.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`✓ Database "${DB_NAME}" created`);
  } else {
    console.log(`• Database "${DB_NAME}" already exists`);
  }
  await admin.end();

  // Step 2: connect to our DB and create tables + seed
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(255) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id    SERIAL PRIMARY KEY,
      name  VARCHAR(50) NOT NULL,
      color VARCHAR(7)  NOT NULL,
      icon  VARCHAR(10) NOT NULL
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
  `);
  console.log('✓ Tables ready');

  // Seed default categories
  await db.query(`
    INSERT INTO categories (name, color, icon) VALUES
      ('Food & Drink',  '#E53935', '🍔'),
      ('Transport',     '#F57C00', '🚗'),
      ('Housing',       '#388E3C', '🏠'),
      ('Shopping',      '#7B1FA2', '🛍'),
      ('Entertainment', '#0288D1', '🎮'),
      ('Health',        '#00838F', '💊')
    ON CONFLICT DO NOTHING;
  `);
  console.log('✓ Default categories seeded');

  // Seed test account
  await db.query(`
    INSERT INTO users (name, email, password)
    VALUES ('Pema Losel', 'pema@test.com', 'test1234')
    ON CONFLICT (email) DO NOTHING;
  `);
  console.log('✓ Test account ready  →  pema@test.com / test1234');

  await db.end();
  console.log('\n✅ Setup complete. Run: npm start');
}

run().catch((err) => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
