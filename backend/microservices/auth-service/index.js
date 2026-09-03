import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { initDb, findUserByEmail, findUserById, createUser } from '../../src/db.js';
import { authenticate, signToken } from '../../src/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

const saltRounds = 10;

// --- REGISTER ENDPOINT ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase();
    if (await findUserByEmail(normalizedEmail)) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser({
      id: `user_${Date.now()}`,
      email: normalizedEmail,
      passwordHash,
      role: "customer",
    });

    const token = signToken(
      { userId: newUser.id, role: newUser.role },
    );

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// --- LOGIN ENDPOINT ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(
      { userId: user.id, role: user.role },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// --- AUTH MIDDLEWARE (protects routes) ---
// (shared `authenticate` middleware imported from src/authMiddleware.js)

// --- PROTECTED PROFILE ENDPOINT ---
app.get('/api/auth/me', authenticate, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong inside the Auth Service!' });
});

app.listen(PORT, () => console.log(`🔒 Auth Microservice running on port ${PORT}`));
