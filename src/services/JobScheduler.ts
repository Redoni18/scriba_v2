import cron from 'node-cron'
import { NewsFetcher } from './NewsFetcher'

export class JobScheduler {
  private newsFetchJob: cron.ScheduledTask
  private newsFetcher: NewsFetcher

  constructor() {
    this.newsFetcher = new NewsFetcher()
    this.newsFetchJob = cron.schedule('0 9-23 * * *', this.fetchAndSaveNews.bind(this)) // Hourly schedule
  }

  start() {
    this.newsFetchJob.start()
    console.log('[JobScheduler] News fetch job scheduled to run every hour.')
  }

  stop() {
    this.newsFetchJob.stop()
    console.log('[JobScheduler] News fetch job stopped.')
  }

  private async fetchAndSaveNews() {
    try {
      console.log('[JobScheduler] Fetching latest news...')
      await this.newsFetcher.fetchLatestNews()
      console.log('[JobScheduler] Finished fetching and saving news.')
    } catch (error) {
      console.error('[JobScheduler] Error fetching and saving news:', error)
    }
  }
}
