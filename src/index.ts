import { JobScheduler } from './services/JobScheduler'

console.log('[App] Starting the application...')

const jobScheduler = new JobScheduler()

jobScheduler.start()

process.on('SIGINT', async () => {
  console.log('[App] Gracefully shutting down...')
  jobScheduler.stop()
  console.log('[App] Scheduler stopped.')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('[App] Received SIGTERM...')
  jobScheduler.stop()
  console.log('[App] Scheduler stopped.')
  process.exit(0)
})
