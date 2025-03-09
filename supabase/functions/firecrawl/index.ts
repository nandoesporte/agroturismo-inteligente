
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ExtractedProperty = {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the Zyte API key
    const ZYTE_API_KEY = Deno.env.get("ZYTE_API_KEY");
    
    if (!ZYTE_API_KEY) {
      throw new Error("Missing Zyte API key");
    }

    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Scraping data from URL: ${url}`);

    // Use the correct Zyte API endpoint
    // Primary and fallback endpoints
    const endpoints = [
      "https://api.zyte.com/v1/extract", 
      "https://extraction.zyte.com/v1/extract"
    ];
    
    let zyteData = null;
    let usedEndpoint = "";
    let errorMessages = [];
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Attempting to connect to Zyte API endpoint: ${endpoint}`);
        
        // Prepare the request for Zyte API with improved selectors
        const zytePayload = {
          url: url,
          extractFrom: {
            propertyListings: {
              selector: [
                "div.property-card",
                "div.listing-item",
                "article.property", 
                ".property-listing", 
                ".destination-item", 
                ".product-card", 
                ".tour-item", 
                ".accommodation-item", 
                ".card", 
                ".item", 
                ".product",
                ".experience-card",
                ".tour-card",
                ".farm-experience",
                ".rural-lodging",
                ".agritourism-item"
              ]
            }
          },
          extract: {
            name: {
              selector: ["h1", "h2", "h3", "h4", ".title", ".name", ".heading", ".product-title"],
              type: "text"
            },
            description: {
              selector: ["p", ".description", ".excerpt", ".summary", ".text", ".info", ".details", ".content"],
              type: "text"
            },
            location: {
              selector: [".location", ".address", ".place", ".region", ".city", ".area", "[itemprop='address']"],
              type: "text"
            },
            price: {
              selector: [".price", ".cost", ".value", ".rate", ".amount", "[itemprop='price']"],
              type: "text"
            },
            image: {
              selector: ["img", ".image", ".photo", ".picture", "[itemprop='image']"],
              type: "attribute",
              attribute: "src"
            },
            activities: {
              selector: [".activities", ".features", ".amenities", ".tags", ".category", ".attractions"],
              type: "list"
            },
            contactPhone: {
              selector: [".phone", "[href^='tel:']", ".telephone", ".contact", "[itemprop='telephone']"],
              type: "text"
            },
            contactEmail: {
              selector: [".email", "[href^='mailto:']", "[itemprop='email']"],
              type: "text"
            },
            contactWebsite: {
              selector: ["a.website", "a.site", ".external-link", "a[href^='http']", "[itemprop='url']"],
              type: "attribute",
              attribute: "href"
            }
          }
        };
        
        // Make the request to Zyte API with increased timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const zyteResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${btoa(ZYTE_API_KEY + ":")}`
          },
          body: JSON.stringify(zytePayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!zyteResponse.ok) {
          const errorText = await zyteResponse.text();
          throw new Error(`Zyte API error (${zyteResponse.status}): ${errorText}`);
        }

        zyteData = await zyteResponse.json();
        usedEndpoint = endpoint;
        console.log(`Successfully connected to endpoint: ${endpoint}`);
        break; // Exit the loop if successful
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error.message);
        errorMessages.push(`${endpoint}: ${error.message}`);
        
        // Continue to the next endpoint
      }
    }
    
    if (!zyteData) {
      throw new Error(`Failed to connect to any Zyte API endpoint. Errors: ${errorMessages.join('; ')}`);
    }

    console.log(`Received response from Zyte API using endpoint: ${usedEndpoint}`);
    
    // Process and clean the extracted data
    const extractedProperties = processZyteResponse(zyteData);
    console.log(`Processed ${extractedProperties.length} properties`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        properties: extractedProperties,
        rawData: zyteData,
        endpoint: usedEndpoint
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

// Helper function to process Zyte API response
function processZyteResponse(data: any): ExtractedProperty[] {
  const extractedProperties: ExtractedProperty[] = [];
  
  // Process property listings if available
  if (data && data.propertyListings && Array.isArray(data.propertyListings)) {
    console.log(`Found ${data.propertyListings.length} property listings`);
    
    data.propertyListings.forEach((item: any) => {
      const property: ExtractedProperty = {
        name: normalizeText(item.name),
        description: normalizeText(item.description),
        location: normalizeText(item.location),
        price: normalizeText(item.price),
        activities: normalizeArray(item.activities),
        image: normalizeUrl(item.image),
        contact: {
          phone: normalizeText(item.contactPhone),
          email: normalizeText(item.contactEmail),
          website: normalizeUrl(item.contactWebsite)
        }
      };
      
      extractedProperties.push(property);
    });
  }
  
  // If no property listings were found, try to extract from the page directly
  if (extractedProperties.length === 0) {
    console.log("No property listings found, trying to extract from the page directly");
    
    // Check if we have info directly at the root level
    if (data && (data.name || data.description || data.price)) {
      const property: ExtractedProperty = {
        name: normalizeText(data.name) || 'Extracted Property',
        description: normalizeText(data.description),
        location: normalizeText(data.location),
        price: normalizeText(data.price),
        activities: normalizeArray(data.activities),
        image: normalizeUrl(data.image),
        contact: {
          phone: normalizeText(data.contactPhone),
          email: normalizeText(data.contactEmail),
          website: normalizeUrl(data.contactWebsite)
        }
      };
      
      extractedProperties.push(property);
    }
  }
  
  // If we still have no properties but have some data, create a generic one
  if (extractedProperties.length === 0 && data) {
    console.log("Creating generic property from available data");
    
    // Create at least one generic property with whatever data we have
    const property: ExtractedProperty = {
      name: findValueInObject(data, ['name', 'title', 'heading']) || 'Extracted Property',
      description: findValueInObject(data, ['description', 'content', 'text', 'summary']),
      location: findValueInObject(data, ['location', 'address', 'place']),
      price: findValueInObject(data, ['price', 'cost', 'value']),
      image: findValueInObject(data, ['image', 'img', 'photo', 'picture']),
      contact: {
        phone: findValueInObject(data, ['contactPhone', 'phone', 'telephone']),
        email: findValueInObject(data, ['contactEmail', 'email']),
        website: findValueInObject(data, ['contactWebsite', 'website', 'url'])
      }
    };
    
    extractedProperties.push(property);
  }
  
  return extractedProperties;
}

// Helper function to find a value in an object using multiple possible keys
function findValueInObject(obj: any, possibleKeys: string[]): string | null {
  if (!obj || typeof obj !== 'object') return null;
  
  for (const key of possibleKeys) {
    if (obj[key] && typeof obj[key] === 'string' && obj[key].trim() !== '') {
      return normalizeText(obj[key]);
    }
  }
  
  // If not found at the top level, search in nested objects (1 level deep only)
  for (const prop in obj) {
    if (obj[prop] && typeof obj[prop] === 'object') {
      for (const key of possibleKeys) {
        if (obj[prop][key] && typeof obj[prop][key] === 'string' && obj[prop][key].trim() !== '') {
          return normalizeText(obj[prop][key]);
        }
      }
    }
  }
  
  return null;
}

// Helper functions to normalize data
function normalizeText(text: any): string {
  if (!text) return '';
  if (typeof text === 'string') return text.trim();
  if (typeof text === 'number') return text.toString();
  return '';
}

function normalizeUrl(url: any): string {
  if (!url) return '';
  if (typeof url === 'string') {
    const trimmedUrl = url.trim();
    // Add http:// if the URL doesn't have a protocol
    if (trimmedUrl && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return 'https://' + trimmedUrl;
    }
    return trimmedUrl;
  }
  return '';
}

function normalizeArray(arr: any): string[] {
  if (!arr) return [];
  if (typeof arr === 'string') return [arr.trim()];
  if (Array.isArray(arr)) return arr.map(item => normalizeText(item)).filter(item => item !== '');
  return [];
}
