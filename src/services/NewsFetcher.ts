import { PrismaClient, Article, NewsSource } from '@prisma/client';
import { AuthorFetcher } from './AuthorFetcher';
import { CategoryFetcher } from './CategoryFetcher';
import { TagFetcher } from './TagFetcher';
import { MediaFetcher } from './MediaFetcher';
import { BaseFetcher } from './BaseFetcher';

const NEWS_SITES = [
  'telegrafi.com',
  'gazetaexpress.com',
  'kallxo.com',
  'insajderi.com',
  'indeksonline.net',
  'gazetablic.com',
  'periskopi.com',
  'klankosova.tv',
];

export class NewsFetcher extends BaseFetcher {
  private prisma: PrismaClient;
  private authorFetcher: AuthorFetcher;
  private categoryFetcher: CategoryFetcher;
  private tagFetcher: TagFetcher;
  private mediaFetcher: MediaFetcher;

  constructor() {
    super();
    this.prisma = new PrismaClient();
    this.authorFetcher = new AuthorFetcher(this.prisma);
    this.categoryFetcher = new CategoryFetcher(this.prisma);
    this.tagFetcher = new TagFetcher(this.prisma);
    this.mediaFetcher = new MediaFetcher();
  }

  async fetchLatestNews(): Promise<void> {
    for (const site of NEWS_SITES) {
      try {
        const newsSource = await this.getOrCreateNewsSource(site);
        
        if (!await this.isSiteAccessible(site)) {
          console.warn(`Skipping ${site} - site appears to be protected or inaccessible`);
          continue;
        }

        const url = `https://${site}/wp-json/wp/v2/posts`;
        const articles = await this.fetchData<Article[]>(url);

        if (Array.isArray(articles) && articles.length > 0) {
          for (const item of articles) {
            await this.processArticle(newsSource, item);
          }
          console.log(`Fetched and stored articles from ${site}`);
        } else {
          console.warn(`No articles found or invalid response from ${site}`);
        }
      } catch (error) {
        this.logError(`Error fetching articles from ${site}:`, error);
      }
    }
  }

  private async getOrCreateNewsSource(site: string): Promise<NewsSource> {
    return this.prisma.newsSource.upsert({
      where: { websiteUrl: `https://${site}` },
      update: {},
      create: {
        name: site,
        websiteUrl: `https://${site}`,
      },
    });
  }

  private async processArticle(newsSource: NewsSource, item: any): Promise<void> {
    const featuredMediaUrl = await this.mediaFetcher.fetchFeaturedMedia(newsSource, item.featured_media);
    const categories = await this.categoryFetcher.fetchAndStoreCategories(newsSource, item.categories || []);
    const tags = await this.tagFetcher.fetchAndStoreTags(newsSource, item.tags || []);
    const author = await this.authorFetcher.fetchAndStoreAuthor(newsSource, item.author);

    const sourceUniqueId = `${newsSource.name}_${item.id}`;

    const article = {
      sourceUniqueId,
      title: item.title.rendered,
      content: item.content.rendered,
      excerpt: item.excerpt.rendered,
      articleSummary: item.excerpt.rendered,
      description: item.excerpt.rendered,
      date: new Date(item.date),
      articleDateTime: new Date(item.date),
      thumbnail: featuredMediaUrl,
      imageCover: featuredMediaUrl,
      articleCover: featuredMediaUrl,
      sourceUrl: item.link,
      newsSourceId: newsSource.id,
    };

    const storedArticle = await this.prisma.article.upsert({
      where: { sourceUniqueId },
      update: article,
      create: article,
    });

    await this.updateArticleRelations(storedArticle.id, categories, tags, author);

    console.log(`Stored article: ${article.title}`);
  }

  private async updateArticleRelations(
    articleId: number, 
    categories: any[], 
    tags: any[], 
    author: any
  ): Promise<void> {
    // Update categories
    await this.prisma.categoryOnArticle.deleteMany({ where: { articleId } });
    await this.prisma.categoryOnArticle.createMany({
      data: categories.map(category => ({ articleId, categoryId: category.id })),
    });

    // Update tags
    await this.prisma.tagOnArticle.deleteMany({ where: { articleId } });
    await this.prisma.tagOnArticle.createMany({
      data: tags.map(tag => ({ articleId, tagId: tag.id })),
    });

    // Update author
    if (author) {
      await this.prisma.authorOnArticle.upsert({
        where: { articleId },
        update: { authorId: author.id },
        create: { articleId, authorId: author.id },
      });
    }
  }

  private async isSiteAccessible(site: string): Promise<boolean> {
    try {
      const response = await fetch(`https://${site}/wp-json/wp/v2/posts?per_page=1`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

