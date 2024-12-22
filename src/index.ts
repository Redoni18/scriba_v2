import { NewsFetcher } from './services/NewsFetcher';

const newsFetcher = new NewsFetcher();

console.log('Starting news fetch job');
newsFetcher.fetchLatestNews();
