# Personal Expense Tracker
### SWE201 Assignment 3 | Student ID: 02240353

> A full-stack React Native (Expo) CRUD application for tracking personal expenses, built with a RESTful API backed by PostgreSQL.

---

## Table of Contents

1. [App Overview](#app-overview)
2. [Domain & Entities](#domain--entities)
3. [State Management](#state-management)
4. [Backend & API](#backend--api)
5. [Project Structure](#project-structure)
6. [Setup Instructions](#setup-instructions)
7. [Features](#features)
8. [Known Limitations](#known-limitations)

---

## App Overview

**Expense Tracker** is a personal expense tracker that lets users record, organise, and review their daily spending. Users sign up for an account, create spending categories (with a custom colour and icon), and log expenses against those categories. The home screen shows a live spending summary with category filtering and full-text search.

---

## Domain & Entities

### Primary Entity — Expense

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, auto-generated | Unique identifier |
| title | string | 2–100 characters, required | Short description of the expense |
| amount | number | positive, required | Amount in Bhutanese Ngultrum (BTN) |
| categoryId | string | FK → Category, required | The category this expense belongs to |
| date | string | YYYY-MM-DD, required | Date the expense occurred |
| notes | string? | optional | Additional free-text notes |
| createdAt | string | auto-set on create | ISO timestamp of record creation |

### Secondary Entity — Category

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, auto-generated | Unique identifier |
| name | string | 2–30 characters, required | Category label (e.g. "Food & Drink") |
| color | string | hex colour, required | Used for UI accents and charts |
| icon | string | emoji, required | Visual identifier shown in lists |

### Auth Entity — User

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Full name |
| email | string | Unique login email |
| password | string | Plain text (mock auth — not for production) |

---

## State Management

**Library chosen: Zustand**

Zustand was selected over Redux and Context API for the following reasons:

- Zero boilerplate — no actions, reducers, or Providers required
- Selector-based subscriptions prevent unnecessary re-renders
- Trivially composable with `@react-native-async-storage/async-storage` for persistence
- Flat, readable store files that are easy to audit

### Stores

| Store | Responsibility |
|-------|---------------|
| `authStore` | Current user session, login, register, logout, startup hydration |
| `expenseStore` | Expense list, active filters, all CRUD operations |
| `categoryStore` | Category list, all CRUD operations, per-ID lookup |

### Persistence (AsyncStorage)

| Key | What is stored |
|-----|---------------|
| `auth_user` | Serialised user object — keeps the user logged in across restarts |
| `expense_filter` | Last-used category filter — restored on next app open |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Selector wrapper — gives screens clean access to auth state and actions |
| `useForm<T>` | Generic controlled-form hook with per-field errors and touched state |
| `useFetchExpenses` | Loads expenses + categories on mount; exposes a `retry` callback |

---

## Backend & API

**Technology:** Node.js + Express + PostgreSQL  
**Base URL:** `http://<your-local-ip>:3001`

The backend is a lightweight Express REST API that connects to a local PostgreSQL database. All request and response bodies use JSON. Field names follow camelCase in the API and are mapped to snake_case internally in the database.

### Endpoints

#### Expenses

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/expenses` | List all expenses | — |
| `GET` | `/expenses/:id` | Get a single expense | — |
| `POST` | `/expenses` | Create a new expense | `{ title, amount, categoryId, date, notes?, createdAt? }` |
| `PATCH` | `/expenses/:id` | Update an expense (partial) | any subset of expense fields |
| `DELETE` | `/expenses/:id` | Delete an expense | — |

#### Categories

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/categories` | List all categories | — |
| `GET` | `/categories/:id` | Get a single category | — |
| `POST` | `/categories` | Create a category | `{ name, color, icon }` |
| `PATCH` | `/categories/:id` | Update a category (partial) | any subset of category fields |
| `DELETE` | `/categories/:id` | Delete a category | — |

#### Users (Auth)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/users?email=x` | Look up a user by email (login) | — |
| `POST` | `/users` | Register a new user | `{ name, email, password }` |

---

## Project Structure

```
SWE201_A3_02240353/
│
├── backend/                    # Express + PostgreSQL REST API
│   ├── server.js               # All route handlers
│   ├── db.js                   # PostgreSQL connection pool
│   ├── setup.js                # One-time DB creation + seeding script
│   ├── schema.sql              # Raw SQL schema (reference)
│   ├── .env                    # DB credentials (gitignored)
│   ├── .env.example            # Credential template
│   └── package.json
│
└── Personal_tracker/           # React Native (Expo) app
    ├── api/
    │   ├── config.ts           # Axios instance + base URL from .env
    │   ├── expenses.ts         # Expense API calls
    │   ├── categories.ts       # Category API calls
    │   └── auth.ts             # Login / register API calls
    │
    ├── store/
    │   ├── authStore.ts        # Zustand auth store
    │   ├── expenseStore.ts     # Zustand expense store + filter persistence
    │   └── categoryStore.ts    # Zustand category store
    │
    ├── hooks/
    │   ├── use-auth.ts         # Auth selector hook
    │   ├── use-form.ts         # Generic form hook
    │   └── use-fetch-expenses.ts # Data-loading hook with retry
    │
    ├── components/
    │   ├── expense-card.tsx    # Expense list item
    │   ├── category-badge.tsx  # Inline category pill
    │   ├── form-field.tsx      # Labelled input with error display
    │   ├── loading-spinner.tsx # Activity indicator wrapper
    │   ├── empty-state.tsx     # No-data placeholder
    │   └── error-message.tsx   # Error card with retry button
    │
    ├── utils/
    │   ├── types.ts            # Shared TypeScript interfaces
    │   ├── formatters.ts       # Currency and date formatters
    │   └── validators.ts       # Form validation functions
    │
    ├── constants/
    │   └── theme.ts            # Design system (colours, radius, shadows)
    │
    └── app/
        ├── _layout.tsx         # Root layout — auth guard + state hydration
        ├── (tabs)/
        │   ├── _layout.tsx     # Bottom tab navigator
        │   ├── index.tsx       # Expenses list screen
        │   └── categories.tsx  # Categories screen
        ├── auth/
        │   ├── login.tsx       # Sign-in screen
        │   └── register.tsx    # Registration screen
        └── expense/
            ├── create.tsx      # New expense form
            └── [id].tsx        # Expense detail + inline edit
```

---

## Setup Instructions

### Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** installed and running locally
- **Expo Go** app installed on your phone (Android or iOS)
- Your phone and computer on the **same Wi-Fi network**

---

### Step 1 — Set up the backend

```bash
cd backend
```

Copy the environment template and fill in your PostgreSQL password:

```bash
cp .env.example .env
```

`.env`:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/personal_tracker
PORT=3001
```

Install dependencies and run the setup script (creates the database, tables, and seeds starter data):

```bash
npm install
npm run setup
```

Start the server:

```bash
npm start
```

The API is now running at `http://localhost:3001`.

---

### Step 2 — Configure the app

Open `Personal_tracker/.env` and set the API URL to your computer's local IP address (run `ipconfig` on Windows to find it):

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3001
```

> Use `localhost` only if running the app on an Android emulator on the same machine.

---

### Step 3 — Run the app

```bash
cd Personal_tracker
npm install
npm start
```

Scan the QR code with **Expo Go**. The app will load and redirect to the login screen.

**Test account (seeded automatically):**
| Field | Value |
|-------|-------|
| Email | pema@test.com |
| Password | test1234 |

Or register a new account directly from the app.

---

## Features

| Feature | Details |
|---------|---------|
| Authentication | Sign up / sign in with email and password. Session persisted via AsyncStorage — no re-login on restart. |
| Expense list | Summary card showing total spending, transaction count, and category count. Horizontal category filter chips. Full-text search with live results. |
| Create expense | Form with a prominent amount input, category grid picker, date field, and optional notes. Full client-side validation before any network call. |
| Expense detail | Read view with colour-coded hero card. Tap **Edit** to switch to inline edit mode. Confirmation dialog before delete. |
| Categories | List view showing each category's total spending, transaction count, and a proportional spending bar. Tap to edit, FAB to create. |
| Create/edit category | Live-preview card updates as you type. 12-colour picker and 16-icon emoji grid. Save button adopts the chosen category colour. |
| Profile sheet | Tap the avatar to open a bottom sheet showing name, email, and account stats. Sign-out button requires confirmation — no accidental logouts. |
| Loading states | `ActivityIndicator` shown on every async operation — list fetch, create, update, delete. |
| Error handling | Distinguishes network errors, timeouts, and server errors. Retry buttons on all failure states. |
| Empty states | Shown on the expense list and categories screen when there is no data to display. |
| Filter persistence | The last-selected category filter is saved to AsyncStorage and restored on the next app launch. |

---

## Known Limitations

- Passwords are stored as plain text in PostgreSQL — this is a mock auth system suitable only for this assignment context
- The date field is a plain text input; no calendar date-picker widget is used
- No offline mode — all CRUD operations require the backend to be reachable
- The app is single-user; there is no per-user data isolation on the expenses table
