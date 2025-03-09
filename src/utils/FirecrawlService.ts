
import { supabase } from '@/lib/supabase';

export type ExtractedProperty = {
  name?: string;
  description?: string;
  location?: string;
  price?: string;
  activities?: string[];
  amenities?: string[];
  hours?: string;
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
      console.log('Making scrape request to Llama AI Edge Function');
      
      const { data, error } = await supabase.functions.invoke('firecrawl', {
        body: { url }
      });

      if (error) {
        console.error('Scrape request failed:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to extract data from website' 
        };
      }

      console.log('AI extraction successful using:', data.endpoint);
      console.log('Properties found:', data.properties?.length || 0);
      
      const properties = data.properties && data.properties.length > 0
        ? data.properties.map((property: ExtractedProperty) => ({
            ...property,
            activities: property.activities || [],
            amenities: property.amenities || [],
            contact: property.contact || { phone: '', email: '', website: '' },
            price: property.price ? this.formatPrice(property.price) : ''
          }))
        : [];
        
      return { 
        success: true,
        properties,
        rawData: data.rawData,
        endpoint: data.endpoint
      };
    } catch (error: any) {
      console.error('Error during AI extraction:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to AI extraction service' 
      };
    }
  }
  
  static formatPrice(priceStr: string): string {
    return formatPrice(priceStr);
  }
}

function formatPrice(priceStr: string): string {
  if (!priceStr) return '';
  
  const numberMatch = priceStr.match(/[\d.,]+/);
  if (!numberMatch) return priceStr;
  
  const cleanNumber = numberMatch[0].replace(/[^\d.,]/g, '');
  
  const hasCurrency = /[R$€£¥]/.test(priceStr);
  
  if (hasCurrency) return priceStr;
  
  return `R$ ${cleanNumber}`;
}
