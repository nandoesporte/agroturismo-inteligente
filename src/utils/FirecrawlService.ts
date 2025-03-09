
import { supabase } from '@/lib/supabase';

export interface ExtractedProperty {
  name?: string;
  description?: string;
  location?: string;
  price?: string;
  type?: string;
  activities?: string[];
  amenities?: string[];
  hours?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  image?: string;
  images?: string[];
}

// Helper function to categorize properties based on keywords
const categorizeProperty = (property: ExtractedProperty): string => {
  const name = property.name?.toLowerCase() || '';
  const desc = property.description?.toLowerCase() || '';
  const activities = property.activities?.map(a => a.toLowerCase()).join(' ') || '';
  const amenities = property.amenities?.map(a => a.toLowerCase()).join(' ') || '';
  const combinedText = `${name} ${desc} ${activities} ${amenities}`;
  
  // Define category keywords for matching
  const categoryMatches: Record<string, string[]> = {
    'Agroturismo': ['agroturismo', 'agro', 'fazenda', 'rural', 'agricultura', 'plantação', 'colheita'],
    'Turismo Rural': ['turismo rural', 'campo', 'sitio', 'interior', 'natureza'],
    'Fazenda': ['fazenda', 'estância', 'ranch', 'gado', 'cavalos', 'agropecuária'],
    'Chalé': ['chalé', 'cabana', 'cabin', 'chalet', 'montanha'],
    'Café Colonial': ['café colonial', 'colonial', 'café', 'gastronomia', 'comida'],
    'Pousada Rural': ['pousada', 'hostel', 'hospedagem rural', 'inn']
  };
  
  // Find matching category
  for (const [category, keywords] of Object.entries(categoryMatches)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return category;
    }
  }
  
  // Default category if no match is found
  return 'Turismo Rural';
};

export class FirecrawlService {
  static async scrapeWebsite(url: string): Promise<{ success: boolean; properties?: ExtractedProperty[]; error?: string }> {
    try {
      console.log(`Starting Firecrawl scraping for URL: ${url}`);
      
      // Add improved retry mechanism with exponential backoff
      let attempt = 0;
      const maxAttempts = 3;
      let lastError: Error | null = null;
      
      while (attempt < maxAttempts) {
        attempt++;
        try {
          // Set a reasonable timeout for the entire operation
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Operation timed out after 30 seconds')), 30000);
          });
          
          // Call the Supabase Edge Function with timeout
          const resultPromise = supabase.functions.invoke('firecrawl', {
            body: { url },
          });
          
          // Race between the function call and the timeout
          const { data, error } = await Promise.race([resultPromise, timeoutPromise]) as any;
          
          if (error) {
            console.error(`Error calling Firecrawl edge function (attempt ${attempt}/${maxAttempts}):`, error);
            lastError = new Error(`Failed to scrape website: ${error.message}`);
            // Wait with exponential backoff before retry
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
              continue;
            }
            throw lastError;
          }
          
          if (!data || !data.success) {
            console.error(`Firecrawl returned an error (attempt ${attempt}/${maxAttempts}):`, data?.error || 'Unknown error');
            lastError = new Error(data?.error || 'Failed to extract data from the website');
            // Wait with exponential backoff before retry
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
              continue;
            }
            throw lastError;
          }
          
          // Process properties, ensuring they have types assigned and are valid
          const properties = (data.properties || [])
            .filter((property: any) => property && typeof property === 'object')
            .map((property: ExtractedProperty) => {
              if (!property.type) {
                property.type = categorizeProperty(property);
              }
              return property;
            });
          
          // Verify we have at least some properties
          if (properties.length === 0) {
            console.warn('No properties extracted from the website');
            // Still succeed but with empty list rather than error
          }
          
          return {
            success: true,
            properties
          };
        } catch (attemptError: any) {
          console.error(`Error in FirecrawlService (attempt ${attempt}/${maxAttempts}):`, attemptError);
          lastError = attemptError;
          // Wait with exponential backoff before retry
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
          }
        }
      }
      
      // All attempts failed
      throw lastError || new Error('Failed to scrape website after multiple attempts');
    } catch (error: any) {
      console.error('Error in FirecrawlService:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
}
