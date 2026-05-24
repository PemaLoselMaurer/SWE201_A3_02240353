# Expense Tracker — Backend API

> Node.js + Express REST API backed by PostgreSQL.  
> Serves the Expense Tracker React Native app on port **3001**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Database | PostgreSQL (via `pg` connection pool) |
| Config | `dotenv` |
| CORS | `cors` middleware |

---

## Folder Structure

```
backend/
├── server.js       # Express app — all route handlers
├── db.js           # PostgreSQL connection pool (singleton)
├── setup.js        # One-time script: create DB, run migrations, seed data
├── schema.sql      # Raw SQL schema for reference
├── .env            # Your local credentials (gitignored)
├── .env.example    # Template to copy
└── package.json
```

---

## First-time Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the template and add your PostgreSQL password:

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/personal_tracker
PORT=3001
```

### 3. Create the database, tables, and seed data

```bash
npm run setup
```

This script will:
- Connect to PostgreSQL using your `DATABASE_URL`
- Create the `personal_tracker` database if it does not exist
- Create the `users`, `categories`, and `expenses` tables
- Insert 6 default categories
- Insert the test account (see below)

### 4. Start the server

```bash
npm start
```

For development with auto-restart on file changes:

```bash
npm run dev
```

The API will be available at `http://localhost:3001`.

---

## Test Account

Created automatically by `npm run setup`:

| Field | Value |
|-------|-------|
| Email | `pema@test.com` |
| Password | `test1234` |

To change these, edit the relevant `INSERT` in `setup.js` before running setup.

---

## Database Schema

```sql
users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
)

categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(50) NOT NULL,
  color VARCHAR(7)  NOT NULL,   -- hex e.g. "#EF4444"
  icon  VARCHAR(10) NOT NULL    -- emoji e.g. "🍔"
)

expenses (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(100)   NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  date        DATE           NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
)
```

---

## API Reference

All responses are JSON. Field names in the API use **camelCase**; the database uses snake_case internally.

### Health Check

```
GET /
→ { "status": "Personal Tracker API running" }
```

---

### Expenses

#### List all expenses
```
GET /expenses
→ Expense[]
```

#### Get single expense
```
GET /expenses/:id
→ Expense | 404
```

#### Create expense
```
POST /expenses
Body: {
  "title":      string,       // required, 2–100 chars
  "amount":     number,       // required, positive
  "categoryId": string,       // required, FK to category
  "date":       "YYYY-MM-DD", // required
  "notes":      string,       // optional
  "createdAt":  string        // optional ISO timestamp
}
→ 201 Expense | 500
```

#### Update expense (partial)
```
PATCH /expenses/:id
Body: any subset of { title, amount, categoryId, date, notes }
→ Expense | 404
```

#### Delete expense
```
DELETE /expenses/:id
→ { "deleted": "id" } | 404
```

---

### Categories

#### List all categories
```
GET /categories
→ Category[]
```

#### Get single category
```
GET /categories/:id
→ Category | 404
```

#### Create category
```
POST /categories
Body: { "name": string, "color": "#hex", "icon": "emoji" }
→ 201 Category | 500
```

#### Update category (partial)
```
PATCH /categories/:id
Body: any subset of { name, color, icon }
→ Category | 404
```

#### Delete category
```
DELETE /categories/:id
→ { "deleted": "id" } | 404
```

---

### Users (Auth)

#### Look up user by email (login flow)
```
GET /users?email=you@example.com
→ User[]   (empty array if not found)
```

#### Register new user
```
POST /users
Body: { "name": string, "email": string, "password": string }
→ 201 User | 409 (duplicate email) | 500
```

---

## Response Shapes

### Expense object
```json
{
  "id":         "1",
  "title":      "Lunch",
  "amount":     120.00,
  "categoryId": "1",
  "date":       "2026-05-24",
  "notes":      "Team lunch",
  "createdAt":  "2026-05-24T08:00:00.000Z"
}
```

### Category object
```json
{
  "id":    "1",
  "name":  "Food & Drink",
  "color": "#E53935",
  "icon":  "🍔"
}
```

### Error response
```json
{ "message": "Description of what went wrong" }
```

---

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run setup` | `node setup.js` | Create DB, run migrations, seed data |
| `npm start` | `node server.js` | Start the production server |
| `npm run dev` | `node --watch server.js` | Start with auto-restart |
