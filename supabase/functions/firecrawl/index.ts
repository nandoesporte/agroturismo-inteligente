
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

    // Using the API endpoint according to docs: https://docs.firecrawl.dev/introduction
    const firecrawlUrl = "https://api.firecrawl.dev/extract";
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
      
      // Try the alternative endpoint format as per documentation
      console.log("Attempting alternative API endpoint...");
      
      const alternativeUrl = "https://api.firecrawl.dev/api/v1/extract";
      console.log(`Making alternative request to: ${alternativeUrl}`);
      
      const alternativeResponse = await fetch(alternativeUrl, {
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
      
      if (!alternativeResponse.ok) {
        const alternativeError = await alternativeResponse.text();
        console.error("Alternative API error:", alternativeError);
        console.error("Alternative status code:", alternativeResponse.status);
        
        // One more attempt with the v2 endpoint as per latest docs
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
        
        if (!v2Response.ok) {
          const v2Error = await v2Response.text();
          console.error("V2 API error:", v2Error);
          throw new Error(`Firecrawl API error: All endpoints failed. Last error: ${v2Error}`);
        }
        
        const v2Data = await v2Response.json();
        console.log("Received v2 response:", JSON.stringify(v2Data, null, 2));
        
        // Process and clean the extracted data from v2
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
      
      const alternativeData = await alternativeResponse.json();
      console.log("Received alternative response:", JSON.stringify(alternativeData, null, 2));
      
      // Process and clean the extracted data from alternative
      const extractedProperties: ExtractedProperty[] = processResponseData(alternativeData);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          properties: extractedProperties,
          rawData: alternativeData,
          endpoint: "alternative"
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
  
  // Handle different response formats that might be returned by different API versions
  if (data && data.properties && Array.isArray(data.properties)) {
    // Handle v1/alternative endpoint format
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
    // Handle primary endpoint format
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
              phone: prop.contactPhone || '',
              email: prop.contactEmail || '',
              website: prop.contactWebsite || ''
            }
          };
          
          extractedProperties.push(property);
        });
      }
    });
  } else if (data && data.data && Array.isArray(data.data)) {
    // Handle a possible v2 format where data is nested under a data key
    data.data.forEach((prop: any) => {
      const property: ExtractedProperty = {
        name: prop.name || prop.title || '',
        description: prop.description || prop.content || '',
        location: prop.location || prop.address || '',
        price: prop.price || '',
        image: prop.image || prop.thumbnail || '',
        contact: {
          phone: prop.contact?.phone || prop.phone || '',
          email: prop.contact?.email || prop.email || '',
          website: prop.contact?.website || prop.website || ''
        }
      };
      
      extractedProperties.push(property);
    });
  }
  
  return extractedProperties;
}
