import { JobScheduler } from './services/JobScheduler'

console.log('Starting the application...')

const jobScheduler = new JobScheduler()

jobScheduler.start()

process.on('SIGINT', () => {
  console.log('Gracefully shutting down...')
  jobScheduler.stop()
  process.exit(0)
})
