import { PrismaClient, Author, NewsSource } from '@prisma/client';
import { BaseFetcher } from './BaseFetcher';

export class AuthorFetcher extends BaseFetcher {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async fetchAndStoreAuthor(newsSource: NewsSource, authorId: number): Promise<Author | null> {
    if (!authorId) return null;

    try {
      const url = `https://${newsSource.name}/wp-json/wp/v2/users/${authorId}`;
      const authorData = await this.fetchData<any>(url);

      if (!authorData.id) {
        this.logError(`Author ID is missing in the response from ${url}`, {});
        return null;
      }

      const sourceUniqueId = `${newsSource.name}_${authorData.id}`;

      return this.prisma.author.upsert({
        where: { sourceUniqueId },
        update: {
          name: authorData.name || "Unknown Author",
          profileImage: authorData.avatar_urls?.['96'] || null,
        },
        create: {
          sourceUniqueId,
          name: authorData.name || "Unknown Author",
          profileImage: authorData.avatar_urls?.['96'] || null,
          newsSource: {
            connect: { id: newsSource.id }
          }
        },
      });
    } catch (error) {
      this.logError(`Error fetching or storing author for site ${newsSource.name}:`, error);
      return null;
    }
  }
}

