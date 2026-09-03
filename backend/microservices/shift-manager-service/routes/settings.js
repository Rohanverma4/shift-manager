import express from 'express'
import { getSettings, saveSettings } from '../../../src/db.js'
import { authenticate } from '../../../src/authMiddleware.js'

const router = express.Router()

router.get('/', authenticate, async (req, res, next) => {
  try {
    const settings = await getSettings(req.user.userId)
    if (!settings) {
      return res.status(200).json({
        shiftConfig: { shiftStart: '09:00', shiftEnd: '18:00' },
        holidays: [],
      })
    }
    res.json(settings)
  } catch (err) {
    next(err)
  }
})

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { shiftConfig, holidays } = req.body
    const saved = await saveSettings(req.user.userId, { shiftConfig, holidays })
    res.json(saved)
  } catch (err) {
    next(err)
  }
})

export default router
