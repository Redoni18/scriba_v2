import { NewsFetcher } from './services/NewsFetcher';

export default async function handler(req: Request) {
  console.log('Cron job triggered: /api/fetchNews');

  if (req.method !== 'GET' && req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const newsFetcher = new NewsFetcher();

  try {
    console.log('Starting news fetch job');
    await newsFetcher.fetchLatestNews();
    console.log('Finished fetching and saving news');
    return new Response(JSON.stringify({ message: 'News fetch completed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching and saving news:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch news', details: error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

