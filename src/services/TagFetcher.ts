import { PrismaClient, Tag, NewsSource } from '@prisma/client';
import { BaseFetcher } from './BaseFetcher';

export class TagFetcher extends BaseFetcher {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async fetchAndStoreTags(newsSource: NewsSource, tagIds: number[]): Promise<Tag[]> {
    if (tagIds.length === 0) return [];

    const storedTags: Tag[] = [];

    for (const tagId of tagIds) {
      try {
        const url = `https://${newsSource.name}/wp-json/wp/v2/tags/${tagId}`;
        const tagData = await this.fetchData<any>(url);

        if (!tagData.id) {
          this.logError(`Tag ID is missing in the response from ${url}`, {});
          continue;
        }

        const sourceUniqueId = `${newsSource.name}_${tagData.id}`;

        const storedTag = await this.prisma.tag.upsert({
          where: { sourceUniqueId },
          update: { name: tagData.name },
          create: {
            sourceUniqueId,
            name: tagData.name,
            newsSource: {
              connect: { id: newsSource.id }
            }
          },
        });

        storedTags.push(storedTag);
      } catch (error) {
        this.logError(`Error fetching or storing tag for site ${newsSource.name}:`, error);
      }
    }

    return storedTags;
  }
}

