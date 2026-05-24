require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./db');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── helpers ────────────────────────────────────────────────────────────────

// Map snake_case DB row → camelCase object the app expects
function rowToExpense(row) {
  return {
    id:         String(row.id),
    title:      row.title,
    amount:     parseFloat(row.amount),
    categoryId: row.category_id ? String(row.category_id) : null,
    date:       row.date instanceof Date
                  ? row.date.toISOString().split('T')[0]
                  : row.date,
    notes:      row.notes ?? undefined,
    createdAt:  row.created_at,
  };
}

function rowToCategory(row) {
  return {
    id:    String(row.id),
    name:  row.name,
    color: row.color,
    icon:  row.icon,
  };
}

function rowToUser(row) {
  return {
    id:       String(row.id),
    name:     row.name,
    email:    row.email,
    password: row.password,
  };
}

// ─── Health ─────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.json({ status: 'Personal Tracker API running' }));

// ─── Users (auth) ────────────────────────────────────────────────────────────

// GET /users?email=x  – used by login to look up account
app.get('/users', async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return res.json(result.rows.map(rowToUser));
    }
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows.map(rowToUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /users  – register
app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email and password are required' });

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password]
    );
    res.status(201).json(rowToUser(result.rows[0]));
  } catch (err) {
    // Duplicate email → 409
    if (err.code === '23505')
      return res.status(409).json({ message: 'Email already registered' });
    res.status(500).json({ message: err.message });
  }
});

// ─── Categories ──────────────────────────────────────────────────────────────

app.get('/categories', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows.map(rowToCategory));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/categories/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Category not found' });
    res.json(rowToCategory(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/categories', async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    const result = await pool.query(
      'INSERT INTO categories (name, color, icon) VALUES ($1, $2, $3) RETURNING *',
      [name, color, icon]
    );
    res.status(201).json(rowToCategory(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/categories/:id', async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let i = 1;
    for (const key of ['name', 'color', 'icon']) {
      if (req.body[key] !== undefined) { fields.push(`${key} = $${i++}`); values.push(req.body[key]); }
    }
    if (!fields.length) return res.status(400).json({ message: 'Nothing to update' });
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Category not found' });
    res.json(rowToCategory(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/categories/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json({ deleted: String(result.rows[0].id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Expenses ────────────────────────────────────────────────────────────────

app.get('/expenses', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY created_at DESC');
    res.json(result.rows.map(rowToExpense));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/expenses/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Expense not found' });
    res.json(rowToExpense(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/expenses', async (req, res) => {
  try {
    const { title, amount, categoryId, date, notes, createdAt } = req.body;
    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category_id, date, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, amount, categoryId || null, date, notes || null, createdAt || new Date()]
    );
    res.status(201).json(rowToExpense(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/expenses/:id', async (req, res) => {
  try {
    const map = { title: 'title', amount: 'amount', categoryId: 'category_id', date: 'date', notes: 'notes' };
    const fields = [];
    const values = [];
    let i = 1;
    for (const [jsKey, dbCol] of Object.entries(map)) {
      if (req.body[jsKey] !== undefined) { fields.push(`${dbCol} = $${i++}`); values.push(req.body[jsKey]); }
    }
    if (!fields.length) return res.status(400).json({ message: 'Nothing to update' });
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Expense not found' });
    res.json(rowToExpense(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/expenses/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Expense not found' });
    res.status(200).json({ deleted: String(result.rows[0].id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
