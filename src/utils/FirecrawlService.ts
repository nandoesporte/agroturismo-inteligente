
import { supabase } from '@/lib/supabase';

export type ExtractedProperty = {
  name?: string;
  description?: string;
  location?: string;
  price?: string;
  activities?: string[];
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  image?: string;
};

export class FirecrawlService {
  static async scrapeWebsite(url: string): Promise<{ 
    success: boolean; 
    properties?: ExtractedProperty[];
    error?: string;
    rawData?: any;
    endpoint?: string;
  }> {
    try {
      console.log('Making scrape request to Firecrawl Edge Function');
      
      const { data, error } = await supabase.functions.invoke('firecrawl', {
        body: { url }
      });

      if (error) {
        console.error('Scrape request failed:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to scrape website' 
        };
      }

      console.log('Scrape successful using endpoint:', data.endpoint);
      console.log('Properties found:', data.properties?.length || 0);
      
      return { 
        success: true,
        properties: data.properties,
        rawData: data.rawData,
        endpoint: data.endpoint
      };
    } catch (error: any) {
      console.error('Error during scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to scraping service' 
      };
    }
  }
}
