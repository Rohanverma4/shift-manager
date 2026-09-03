import express from 'express'

const router = express.Router()

function calculateDuration(startDate, endDate, startTime, endTime, shiftConfig, holidays) {
  const start = new Date(`${startDate}T${startTime}:00`)
  const end = new Date(`${endDate}T${endTime}:00`)

  if (end <= start) return null

  const holidaySet = new Set(holidays.map((d) => d.toLowerCase()))

  let totalMs = 0
  let workingDays = 0
  let holidaysCount = 0

  const current = new Date(start)
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0]
    const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    const isStart = dateStr === startDate
    const isEnd = dateStr === endDate

    if (holidaySet.has(dayName)) {
      holidaysCount++
    } else {
      workingDays++

      let dayStart, dayEnd
      if (isStart && isEnd) {
        dayStart = start
        dayEnd = end
      } else if (isStart) {
        dayStart = start
        dayEnd = new Date(`${dateStr}T${shiftConfig.shiftEnd}:00`)
      } else if (isEnd) {
        dayStart = new Date(`${dateStr}T${shiftConfig.shiftStart}:00`)
        dayEnd = end
      } else {
        dayStart = new Date(`${dateStr}T${shiftConfig.shiftStart}:00`)
        dayEnd = new Date(`${dateStr}T${shiftConfig.shiftEnd}:00`)
      }

      totalMs += dayEnd - dayStart
    }

    current.setDate(current.getDate() + 1)
  }

  const totalHours = Math.floor(totalMs / (1000 * 60 * 60))
  const totalMinutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))

  return { totalHours, totalMinutes, workingDays, holidaysCount }
}

router.post('/calculate', (req, res) => {
  const { startDate, endDate, startTime, endTime, shiftConfig, holidays } = req.body

  if (!startDate || !endDate || !startTime || !endTime) {
    return res.status(400).json({ error: 'startDate, endDate, startTime, endTime are required' })
  }

  const config = shiftConfig || { shiftStart: '09:00', shiftEnd: '18:00' }
  const holidayList = holidays || []

  const result = calculateDuration(startDate, endDate, startTime, endTime, config, holidayList)

  if (!result) {
    return res.status(400).json({ error: 'Invalid date/time range. End must be after start.' })
  }

  res.json(result)
})

export default router
