
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
    // Use the Zyte API key instead of Firecrawl
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

    // Zyte API endpoint
    const zyteUrl = "https://extraction.zyte.com/v1/extract";
    console.log(`Making request to Zyte API endpoint: ${zyteUrl}`);
    
    // Prepare the request for Zyte API
    const zytePayload = {
      url: url,
      extractFrom: {
        propertyItems: {
          // Multiple selectors to try and capture different property structures
          selector: "div.property-card, div.listing-item, article.property, .property-listing, .destination-item, .product-card, .tour-item, .accommodation-item, .card, .item, .product",
        }
      },
      extract: {
        name: {
          selector: "h1, h2, h3, h4, .title, .name, .heading",
          type: "text"
        },
        description: {
          selector: "p, .description, .excerpt, .summary, .text",
          type: "text"
        },
        location: {
          selector: ".location, .address, .place, .region",
          type: "text"
        },
        price: {
          selector: ".price, .cost, .value",
          type: "text"
        },
        image: {
          selector: "img",
          type: "attribute",
          attribute: "src"
        },
        contactPhone: {
          selector: ".phone, [href^='tel:'], .telephone, .contact",
          type: "text"
        },
        contactEmail: {
          selector: ".email, [href^='mailto:']",
          type: "text"
        },
        contactWebsite: {
          selector: "a.website, a.site, .external-link, a[href^='http']",
          type: "attribute",
          attribute: "href"
        }
      }
    };
    
    // Make the request to Zyte API
    const zyteResponse = await fetch(zyteUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(ZYTE_API_KEY + ":")}`
      },
      body: JSON.stringify(zytePayload)
    });

    if (!zyteResponse.ok) {
      const errorText = await zyteResponse.text();
      console.error("Zyte API error:", errorText);
      console.error("Status code:", zyteResponse.status);
      
      throw new Error(`Zyte API error: ${errorText}`);
    }

    const zyteData = await zyteResponse.json();
    console.log("Received response from Zyte API:", JSON.stringify(zyteData, null, 2));

    // Process and clean the extracted data
    const extractedProperties = processZyteResponse(zyteData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        properties: extractedProperties,
        rawData: zyteData,
        endpoint: "zyte"
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
  
  // Handle the specific Zyte API response format
  if (data && data.propertyItems) {
    // If Zyte found property items
    data.propertyItems.forEach((item: any) => {
      const property: ExtractedProperty = {
        name: item.name || '',
        description: item.description || '',
        location: item.location || '',
        price: item.price || '',
        image: item.image || '',
        contact: {
          phone: item.contactPhone || '',
          email: item.contactEmail || '',
          website: item.contactWebsite || ''
        }
      };
      
      extractedProperties.push(property);
    });
  } else if (data && data.name) {
    // If Zyte found a single property
    const property: ExtractedProperty = {
      name: data.name || '',
      description: data.description || '',
      location: data.location || '',
      price: data.price || '',
      image: data.image || '',
      contact: {
        phone: data.contactPhone || '',
        email: data.contactEmail || '',
        website: data.contactWebsite || ''
      }
    };
    
    extractedProperties.push(property);
  }
  
  // If no properties were found but we have some general data
  if (extractedProperties.length === 0 && data) {
    console.log("No properties found in structured format, attempting general extraction");
    
    // Create at least one generic property with whatever data we have
    const property: ExtractedProperty = {
      name: data.title || data.name || 'Extracted Property',
      description: data.content || data.description || '',
      location: data.location || '',
      price: data.price || '',
      image: data.image || '',
      contact: {
        phone: data.contactPhone || data.phone || '',
        email: data.contactEmail || data.email || '',
        website: data.contactWebsite || data.website || ''
      }
    };
    
    extractedProperties.push(property);
  }
  
  return extractedProperties;
}
