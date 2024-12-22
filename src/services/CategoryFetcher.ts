import { PrismaClient, Category, NewsSource } from '@prisma/client';
import { BaseFetcher } from './BaseFetcher';

export class CategoryFetcher extends BaseFetcher {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super();
    this.prisma = prisma;
  }

  async fetchAndStoreCategories(newsSource: NewsSource, categoryIds: number[]): Promise<Category[]> {
    if (categoryIds.length === 0) return [];

    const storedCategories: Category[] = [];

    for (const categoryId of categoryIds) {
      try {
        const url = `https://${newsSource.name}/wp-json/wp/v2/categories/${categoryId}`;
        const categoryData = await this.fetchData<any>(url);

        if (!categoryData.id) {
          this.logError(`Category ID is missing in the response from ${url}`, {});
          continue;
        }

        const sourceUniqueId = `${newsSource.name}_${categoryData.id}`;

        const storedCategory = await this.prisma.category.upsert({
          where: { sourceUniqueId },
          update: { name: categoryData.name },
          create: {
            sourceUniqueId,
            name: categoryData.name,
            newsSource: {
              connect: { id: newsSource.id }
            }
          },
        });

        storedCategories.push(storedCategory);
      } catch (error) {
        this.logError(`Error fetching or storing category for site ${newsSource.name}:`, error);
      }
    }

    return storedCategories;
  }
}

