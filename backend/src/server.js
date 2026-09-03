import express from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { initDb } from './db.js'
import authRoutes from '../microservices/auth-service/routes.js'
import shiftRoutes from '../microservices/shift-manager-service/routes/shift.js'
import settingsRoutes from '../microservices/shift-manager-service/routes/settings.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/shift', shiftRoutes)
app.use('/settings', settingsRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// Serve the built frontend (look in several likely locations)
const distCandidates = [
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, '..', '..', 'frontend', 'dist'),
]
const frontendDist = distCandidates.find((d) => existsSync(d))

if (frontendDist) {
  app.use(express.static(frontendDist))
  app.get(/^(?!\/api\/?|\/shift|\/settings|\/health).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

async function start() {
  try {
    await initDb()
    app.listen(PORT, () => {
      console.log(`Backend unified service running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to initialize database:', err)
    process.exit(1)
  }
}

start()
