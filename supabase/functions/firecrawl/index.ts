
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
        
        // Updated request structure for Zyte API
        const zytePayload = {
          url: url,
          browserHtml: true,
          // Using the correct schema structure based on Zyte API docs
          article: {
            headline: true,
            datePublished: true,
            author: true,
            description: true,
            text: true,
            image: true
          },
          product: {
            name: true,
            description: true,
            price: true,
            images: true
          },
          // For tourism and property sites, using the correct selectors
          additionalSelectors: [
            {
              name: "propertyInfo",
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
              ],
              type: "group",
              extractors: {
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
            }
          ]
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
  
  // Check if we have property data in additionalSelectors
  if (data && data.additionalSelectors && Array.isArray(data.additionalSelectors)) {
    const propertyInfoItems = data.additionalSelectors.filter(item => item.name === "propertyInfo");
    
    if (propertyInfoItems.length > 0 && Array.isArray(propertyInfoItems[0].results)) {
      console.log(`Found ${propertyInfoItems[0].results.length} property listings in additionalSelectors`);
      
      propertyInfoItems[0].results.forEach((item: any) => {
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
  }
  
  // If no properties found, try to get data from product info
  if (extractedProperties.length === 0 && data && data.product) {
    console.log("No property listings found in additionalSelectors, checking product data");
    
    const property: ExtractedProperty = {
      name: normalizeText(data.product.name),
      description: normalizeText(data.product.description),
      price: normalizeText(data.product.price),
      image: data.product.images && data.product.images.length > 0 ? 
        normalizeUrl(data.product.images[0]) : '',
      contact: {
        phone: '',
        email: '',
        website: ''
      }
    };
    
    if (Object.values(property).some(val => val && val !== '')) {
      extractedProperties.push(property);
    }
  }
  
  // Try to extract from article if still no properties
  if (extractedProperties.length === 0 && data && data.article) {
    console.log("No property listings found in product data, checking article data");
    
    const property: ExtractedProperty = {
      name: normalizeText(data.article.headline),
      description: normalizeText(data.article.description || data.article.text),
      image: normalizeUrl(data.article.image),
      contact: {
        phone: '',
        email: '',
        website: ''
      }
    };
    
    if (Object.values(property).some(val => val && val !== '')) {
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
