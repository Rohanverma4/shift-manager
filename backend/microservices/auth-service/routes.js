import express from 'express'
import bcrypt from 'bcryptjs'
import { findUserByEmail, findUserById, createUser } from '../../src/db.js'
import { authenticate, signToken } from '../../src/authMiddleware.js'

const router = express.Router()
const saltRounds = 10

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const normalizedEmail = email.toLowerCase()
    if (await findUserByEmail(normalizedEmail)) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, saltRounds)
    const newUser = await createUser({
      id: `user_${Date.now()}`,
      email: normalizedEmail,
      passwordHash,
      role: 'customer',
    })

    const token = signToken({ userId: newUser.id, role: newUser.role })

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken({ userId: user.id, role: user.role })

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
})

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json({ id: user.id, email: user.email, role: user.role })
  } catch (err) {
    next(err)
  }
})

export default router
