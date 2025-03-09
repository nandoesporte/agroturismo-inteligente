
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

// List of blocked domains that commonly return 403 errors
const KNOWN_BLOCKED_DOMAINS = [
  'tripadvisor.com',
  'tripadvisor.com.br',
  'booking.com',
  'airbnb.com',
  'hotels.com',
  'expedia.com',
  'agoda.com',
  'kayak.com',
  'trivago.com',
  'trivago.com.br'
];

export class FirecrawlService {
  static async scrapeWebsite(url: string): Promise<{ success: boolean; properties?: ExtractedProperty[]; error?: string }> {
    try {
      console.log(`Starting Firecrawl scraping for URL: ${url}`);
      
      // Check if the URL contains any of the known blocked domains
      if (KNOWN_BLOCKED_DOMAINS.some(domain => url.includes(domain))) {
        console.warn(`The URL contains a domain (${KNOWN_BLOCKED_DOMAINS.find(domain => url.includes(domain))}) that typically blocks scraping requests`);
        
        // For Trivago URLs specifically, we can try to extract some context from the URL itself
        if (url.includes('trivago')) {
          // Create some fallback properties based on the URL
          const urlParts = url.split('/');
          const searchParams = url.split('search=')[1];
          const locationHint = searchParams ? decodeURIComponent(searchParams.split('&')[0]) : '';
          
          // Return fallback properties for Trivago
          return {
            success: true,
            properties: [
              {
                name: "Este site não permite acesso direto",
                description: "Não foi possível acessar este site pois ele bloqueia solicitações automáticas (erro 403 Forbidden).",
                location: locationHint || "Paraná",
                contact: {
                  website: url
                },
                type: url.includes('agroturismo') ? 'Agroturismo' : 
                      url.includes('pousada-rural') ? 'Pousada Rural' : 
                      url.includes('fazenda') ? 'Fazenda' : 
                      url.includes('chales') ? 'Chalé' : 'Turismo Rural',
                activities: [],
                amenities: []
              }
            ]
          };
        }
        
        // Return a useful error message for other blocked sites
        return {
          success: false,
          error: `Este site (${new URL(url).hostname}) bloqueia acesso automático. Por favor, tente um site diferente ou use a opção de formulário manual.`
        };
      }
      
      // Add improved retry mechanism with exponential backoff
      let attempt = 0;
      const maxAttempts = 3;
      let lastError: Error | null = null;
      
      while (attempt < maxAttempts) {
        attempt++;
        try {
          // Set a reasonable timeout for the entire operation
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Operation timed out after 60 seconds')), 60000);
          });
          
          // Call the Supabase Edge Function with timeout
          const resultPromise = supabase.functions.invoke('firecrawl', {
            body: { url },
          });
          
          // Race between the function call and the timeout
          const { data, error } = await Promise.race([resultPromise, timeoutPromise]) as any;
          
          if (error) {
            console.error(`Error calling Firecrawl edge function (attempt ${attempt}/${maxAttempts}):`, error);
            
            // Special handling for 403 errors
            if (error.message && (error.message.includes('403') || error.message.includes('Forbidden'))) {
              return {
                success: false,
                error: `O site ${new URL(url).hostname} está bloqueando acesso (403 Forbidden). Por favor, tente um site diferente ou use a função de adicionar manualmente.`
              };
            }
            
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
            
            // If it's a 403 error, return a user-friendly message
            if (data?.error && (data.error.includes('403') || data.error.includes('Forbidden'))) {
              return {
                success: false,
                error: `O site ${new URL(url).hostname} está bloqueando acesso (403 Forbidden). Por favor, tente um site diferente ou use a função de adicionar manualmente.`
              };
            }
            
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
            .filter((property: any) => property && typeof property === 'object' && property.name)
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
          
          // If it's a 403 error, return a user-friendly message
          if (attemptError.message && (attemptError.message.includes('403') || attemptError.message.includes('Forbidden'))) {
            return {
              success: false,
              error: `O site ${new URL(url).hostname} está bloqueando acesso (403 Forbidden). Por favor, tente um site diferente ou use a função de adicionar manualmente.`
            };
          }
          
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
      
      // Check if it's a 403 error
      if (error.message && (error.message.includes('403') || error.message.includes('Forbidden'))) {
        return {
          success: false,
          error: `O site está bloqueando acesso (403 Forbidden). Por favor, tente um site diferente ou use a função de adicionar manualmente.`
        };
      }
      
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
}
