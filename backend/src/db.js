import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      shift_start TEXT NOT NULL DEFAULT '09:00',
      shift_end TEXT NOT NULL DEFAULT '18:00',
      holidays JSONB NOT NULL DEFAULT '[]',
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)
}

// ---- Users ----
export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  )
  return rows[0] || null
}

export async function findUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  return rows[0] || null
}

export async function createUser({ id, email, passwordHash, role = 'customer' }) {
  await pool.query(
    `INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
    [id, email.toLowerCase(), passwordHash, role]
  )
  return findUserById(id)
}

// ---- Settings ----
export async function getSettings(userId) {
  const { rows } = await pool.query(
    'SELECT shift_start, shift_end, holidays FROM settings WHERE user_id = $1',
    [userId]
  )
  if (!rows[0]) return null
  const row = rows[0]
  return {
    shiftConfig: { shiftStart: row.shift_start, shiftEnd: row.shift_end },
    holidays: row.holidays || [],
  }
}

export async function saveSettings(userId, { shiftConfig, holidays }) {
  const shiftStart = shiftConfig?.shiftStart || '09:00'
  const shiftEnd = shiftConfig?.shiftEnd || '18:00'
  const holidaysArr = holidays || []

  await pool.query(
    `INSERT INTO settings (user_id, shift_start, shift_end, holidays, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       shift_start = EXCLUDED.shift_start,
       shift_end = EXCLUDED.shift_end,
       holidays = EXCLUDED.holidays,
       updated_at = NOW()`,
    [userId, shiftStart, shiftEnd, JSON.stringify(holidaysArr)]
  )

  return getSettings(userId)
}

export default pool
