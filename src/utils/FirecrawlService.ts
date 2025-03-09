
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
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('firecrawl', {
        body: { url },
      });
      
      if (error) {
        console.error('Error calling Firecrawl edge function:', error);
        throw new Error(`Failed to scrape website: ${error.message}`);
      }
      
      if (!data || !data.success) {
        console.error('Firecrawl returned an error:', data?.error || 'Unknown error');
        throw new Error(data?.error || 'Failed to extract data from the website');
      }
      
      // Process properties, ensuring they have types assigned
      const properties = (data.properties || []).map((property: ExtractedProperty) => {
        if (!property.type) {
          property.type = categorizeProperty(property);
        }
        return property;
      });
      
      return {
        success: true,
        properties
      };
    } catch (error: any) {
      console.error('Error in FirecrawlService:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
}
