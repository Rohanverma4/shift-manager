import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import shiftRoutes from './routes/shift.js'
import settingsRoutes from './routes/settings.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

app.use('/shift', shiftRoutes)
app.use('/settings', settingsRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'shift-manager' })
})

app.listen(PORT, () => {
  console.log(`Shift Manager Service running on port ${PORT}`)
})
