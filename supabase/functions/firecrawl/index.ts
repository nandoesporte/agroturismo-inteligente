
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
    // Use the API key provided by the user
    const FIRECRAWL_API_KEY = "fc-a0d24fd2d0074dcd8ed94a7082bf19c2";
    
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

    // Call Firecrawl API to extract data - Using the correct API endpoint format
    const firecrawlUrl = "https://api.firecrawl.dev/api/v1/extract";
    console.log(`Making request to Firecrawl API endpoint: ${firecrawlUrl}`);
    
    const firecrawlResponse = await fetch(firecrawlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url: url,
        selectors: {
          properties: {
            selector: "div.property-card, div.listing-item, article.property, .property-listing, .destination-item, .product-card, .tour-item, .accommodation-item, .card, .item, .product",
            type: "list",
            properties: {
              name: "h1, h2, h3, h4, .title, .name, .heading",
              description: "p, .description, .excerpt, .summary, .text",
              location: ".location, .address, .place, .region",
              price: ".price, .cost, .value",
              image: {
                selector: "img",
                type: "attribute",
                attribute: "src"
              },
              contact: {
                properties: {
                  phone: ".phone, [href^='tel:'], .telephone, .contact",
                  email: ".email, [href^='mailto:']",
                  website: {
                    selector: "a.website, a.site, .external-link, a[href^='http']",
                    type: "attribute",
                    attribute: "href"
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
      console.error("Status code:", firecrawlResponse.status);
      console.error("Status text:", firecrawlResponse.statusText);
      throw new Error(`Firecrawl API error: ${errorText}`);
    }

    const data = await firecrawlResponse.json();
    console.log("Received response from Firecrawl API:", JSON.stringify(data, null, 2));

    // Process and clean the extracted data
    const extractedProperties: ExtractedProperty[] = [];
    
    if (data && data.properties && Array.isArray(data.properties)) {
      data.properties.forEach((prop: any) => {
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
