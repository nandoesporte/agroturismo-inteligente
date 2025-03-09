
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

    // Official API endpoint from docs: https://docs.firecrawl.dev/introduction
    const firecrawlUrl = "https://api.firecrawl.dev/extract";
    console.log(`Making request to Firecrawl API endpoint: ${firecrawlUrl}`);
    
    const selector = {
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
    };
    
    const firecrawlResponse = await fetch(firecrawlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url: url,
        selectors: selector
      })
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error("Firecrawl API error:", errorText);
      console.error("Status code:", firecrawlResponse.status);
      
      // Fallback to the v2 endpoint
      console.log("Attempting v2 API endpoint...");
      
      const v2Url = "https://api.firecrawl.dev/api/v2/extract";
      console.log(`Making v2 request to: ${v2Url}`);
      
      const v2Response = await fetch(v2Url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${FIRECRAWL_API_KEY}`
        },
        body: JSON.stringify({
          url: url,
          selectors: selector
        })
      });
      
      if (!v2Response.ok) {
        const v2Error = await v2Response.text();
        console.error("V2 API error:", v2Error);
        
        throw new Error(`Firecrawl API error: Could not connect to any endpoint. Last error: ${v2Error}`);
      }
      
      const v2Data = await v2Response.json();
      console.log("Received v2 response:", JSON.stringify(v2Data, null, 2));
      
      // Process the extracted data
      const extractedProperties: ExtractedProperty[] = processResponseData(v2Data);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          properties: extractedProperties,
          rawData: v2Data,
          endpoint: "v2"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await firecrawlResponse.json();
    console.log("Received response from Firecrawl API:", JSON.stringify(data, null, 2));

    // Process and clean the extracted data
    const extractedProperties: ExtractedProperty[] = processResponseData(data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        properties: extractedProperties,
        rawData: data,
        endpoint: "primary"
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

// Helper function to process different response structures
function processResponseData(data: any): ExtractedProperty[] {
  const extractedProperties: ExtractedProperty[] = [];
  
  // Handle different response formats
  if (data && data.data && Array.isArray(data.data.properties)) {
    // Handle v2 format
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
  } else if (data && Array.isArray(data.properties)) {
    // Handle direct properties array format
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
  } else if (data && data.results && Array.isArray(data.results)) {
    // Handle primary endpoint format with results array
    data.results.forEach((item: any) => {
      if (item.properties && Array.isArray(item.properties)) {
        item.properties.forEach((prop: any) => {
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
    });
  } else if (data && data.content) {
    // Handle simple content format
    try {
      // Try to parse any JSON content that might be embedded
      const parsedContent = typeof data.content === 'string' 
        ? JSON.parse(data.content) 
        : data.content;
      
      if (Array.isArray(parsedContent)) {
        parsedContent.forEach((item: any) => {
          const property: ExtractedProperty = {
            name: item.name || item.title || '',
            description: item.description || item.content || '',
            location: item.location || item.address || '',
            price: item.price || '',
            image: item.image || item.thumbnail || '',
            contact: {
              phone: item.contact?.phone || item.phone || '',
              email: item.contact?.email || item.email || '',
              website: item.contact?.website || item.website || ''
            }
          };
          
          extractedProperties.push(property);
        });
      }
    } catch (e) {
      console.error("Error parsing content:", e);
    }
  }
  
  // If no properties were found, try a more general approach
  if (extractedProperties.length === 0) {
    console.log("No properties found in structured format, attempting general extraction");
    
    // Create at least one generic property with whatever data we have
    const property: ExtractedProperty = {
      name: data.title || 'Extracted Property',
      description: data.content || data.description || '',
      location: data.location || '',
      price: '',
      image: data.image || '',
      contact: {
        phone: '',
        email: '',
        website: ''
      }
    };
    
    extractedProperties.push(property);
  }
  
  return extractedProperties;
}
