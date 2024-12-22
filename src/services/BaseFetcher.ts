export abstract class BaseFetcher {
    protected async fetchData<T>(url: string): Promise<T> {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json() as T;
      } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error);
        throw error;
      }
    }
  
    protected logError(message: string, error: unknown): void {
      console.error(message, error);
    }
  }
  
  