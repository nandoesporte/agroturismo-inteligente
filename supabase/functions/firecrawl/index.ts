
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
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      throw new Error("Missing Firecrawl API key");
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

    // Call Firecrawl API to extract data
    const firecrawlResponse = await fetch("https://api.firecrawl.dev/v1/api/crawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url: url,
        limit: 5, // Limit number of pages to crawl
        scrapeOptions: {
          extractRules: {
            properties: {
              selector: "div.property-card, div.listing-item, article.property, .property-listing",
              type: "list",
              properties: {
                name: ".property-name, .property-title, h2, h3",
                description: ".property-description, .description, p",
                location: ".property-location, .location, .address",
                price: ".property-price, .price",
                image: {
                  selector: "img",
                  type: "attribute",
                  attribute: "src"
                },
                contact: {
                  selector: ".contact-info, .contact",
                  properties: {
                    phone: ".phone, [href^='tel:']",
                    email: ".email, [href^='mailto:']",
                    website: {
                      selector: "a.website, .website a, a.site",
                      type: "attribute",
                      attribute: "href"
                    }
                  }
                }
              }
            }
          }
        }
      })
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error("Firecrawl API error:", errorText);
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const data = await firecrawlResponse.json();
    console.log("Received response from Firecrawl API:", JSON.stringify(data, null, 2));

    // Process and clean the extracted data
    const extractedProperties: ExtractedProperty[] = [];
    
    if (data && data.data && Array.isArray(data.data.properties)) {
      data.data.properties.forEach((prop: any) => {
        const property: ExtractedProperty = {
          name: prop.name || '',
          description: prop.description || '',
          location: prop.location || '',
          price: prop.price || '',
          image: prop.image || '',
          contact: {
            phone: prop.contact?.phone || '',
            email: prop.contact?.email || '',
            website: prop.contact?.website || ''
          }
        };
        
        extractedProperties.push(property);
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        properties: extractedProperties,
        rawData: data
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
