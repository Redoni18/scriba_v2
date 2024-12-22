import cron from 'node-cron'
import { NewsFetcher } from './NewsFetcher'

export class JobScheduler {
  private newsFetchJob: cron.ScheduledTask
  private newsFetcher: NewsFetcher

  constructor() {
    this.newsFetcher = new NewsFetcher()
    this.newsFetchJob = cron.schedule('*/1 * * * *', this.fetchAndSaveNews.bind(this))
  }

  start() {
    this.newsFetchJob.start()
    console.log('News fetch job scheduled to run every 1 minute')
  }

  stop() {
    this.newsFetchJob.stop()
    console.log('News fetch job stopped')
  }

  private async fetchAndSaveNews() {
    try {
      console.log('Fetching latest news')
      await this.newsFetcher.fetchLatestNews()
      console.log('Finished fetching and saving news')
    } catch (error) {
      console.log('Error fetching and saving news:', error)
    }
  }
}

