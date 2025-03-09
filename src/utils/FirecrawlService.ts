// Add any necessary imports here if needed

export interface ExtractedProperty {
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
}

class FirecrawlServiceClass {
  async scrapeWebsite(url: string): Promise<{ 
    success: boolean; 
    properties?: ExtractedProperty[]; 
    error?: string 
  }> {
    try {
      console.log(`Scraping website: ${url}`);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/firecrawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error from scrape API:', errorText);
        throw new Error(`Error from scraping service: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Scraping was not successful:', data.error || 'Unknown error');
        throw new Error(data.error || 'Falha na extração de dados');
      }
      
      console.log('Scraped properties:', data.properties);
      
      // Process and normalize property data
      const properties = this.normalizeProperties(data.properties || []);
      
      return {
        success: true,
        properties: properties
      };
      
    } catch (error: any) {
      console.error('Error in scrapeWebsite:', error);
      return {
        success: false,
        error: error.message || 'Erro ao extrair dados do site'
      };
    }
  }
  
  private normalizeProperties(properties: ExtractedProperty[]): ExtractedProperty[] {
    return properties.map(property => {
      // Clean and normalize price
      let normalizedPrice = property.price || '';
      // Keep original price format for display, but ensure it can be parsed later
      
      // Make sure arrays are actually arrays
      const activities = Array.isArray(property.activities) 
        ? property.activities 
        : property.activities ? [property.activities] : [];
        
      const amenities = Array.isArray(property.amenities) 
        ? property.amenities 
        : property.amenities ? [property.amenities] : [];
      
      return {
        name: property.name || 'Propriedade sem nome',
        description: property.description || '',
        location: property.location || 'Localização não informada',
        price: normalizedPrice,
        activities: activities.filter(a => a && a.trim() !== ''),
        amenities: amenities.filter(a => a && a.trim() !== ''),
        hours: property.hours || 'Não informado',
        contact: {
          phone: property.contact?.phone || 'Não informado',
          email: property.contact?.email || '',
          website: property.contact?.website || ''
        },
        image: property.image || ''
      };
    });
  }
}

export const FirecrawlService = new FirecrawlServiceClass();
