import { NewsSource } from '@prisma/client';
import { BaseFetcher } from './BaseFetcher';

export class MediaFetcher extends BaseFetcher {
  async fetchFeaturedMedia(newsSource: NewsSource, featuredMediaId: number): Promise<string | null> {
    if (!featuredMediaId) return null;

    try {
      const url = `https://${newsSource.name}/wp-json/wp/v2/media/${featuredMediaId}`;
      const data = await this.fetchData<{ source_url: string }>(url);
      return data.source_url || null;
    } catch (error) {
      this.logError(`Error fetching featured media (ID: ${featuredMediaId}) from ${newsSource.name}:`, error);
      return null;
    }
  }
}

