
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
    // Use the GROQ API key for Llama model
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    
    if (!GROQ_API_KEY) {
      throw new Error("Missing GROQ API key");
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

    console.log(`Extracting data from URL: ${url}`);

    // First, fetch the HTML content of the website
    try {
      console.log(`Fetching content from URL: ${url}`);
      const fetchResponse = await fetch(url);
      
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch URL content: ${fetchResponse.status}`);
      }
      
      const htmlContent = await fetchResponse.text();
      console.log(`Successfully fetched ${htmlContent.length} bytes of HTML content`);
      
      // Extract only the main content to reduce token usage
      // Focus on main, article, or div sections with product/property info
      const mainContent = extractMainContent(htmlContent);
      
      // Truncate content more aggressively to stay within token limits
      // Llama3-8b has 8k token limit, so we need to be very conservative
      const truncatedContent = mainContent.length > 10000 
        ? mainContent.substring(0, 10000) + "..." 
        : mainContent;
      
      console.log(`Reduced content to ${truncatedContent.length} bytes`);
      
      // Create a prompt for the AI to extract structured data
      const prompt = `
        You are an expert data extraction AI. I will give you HTML content from a tourism or property website, 
        and I need you to extract structured information about properties, accommodations, or tourism experiences.
        
        Extract up to 5 properties or experiences you find. For each one, provide:
        1. Name of the property/experience
        2. Description (brief, 1-2 sentences)
        3. Location
        4. Price (if available)
        5. Activities or features (up to 5 items)
        6. Contact information (phone, email, website - if available)
        7. Image URL (if found)
        
        Format your response as a valid JSON array with properties in this exact structure:
        [
          {
            "name": "Property Name",
            "description": "Description text",
            "location": "Location details",
            "price": "Price information",
            "activities": ["activity1", "activity2"],
            "contact": {
              "phone": "phone number",
              "email": "email address",
              "website": "website url"
            },
            "image": "image url"
          }
        ]
        
        Here is the HTML content:
        ${truncatedContent}
        
        Only respond with the JSON. Do not include any explanations before or after the JSON.
      `;
      
      console.log("Sending request to GROQ API for Llama extraction");
      
      // Make the request to the Groq API with Llama model
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.3, // Lower temperature for more consistent output
          max_tokens: 3000
        })
      });

      if (!groqResponse.ok) {
        const errorData = await groqResponse.text();
        console.error("GROQ API error:", errorData);
        throw new Error(`GROQ API error: ${groqResponse.status} - ${errorData}`);
      }

      const aiData = await groqResponse.json();
      console.log("Received response from GROQ API");
      
      let extractedProperties: ExtractedProperty[] = [];
      
      try {
        // Extract the JSON part from the AI response
        const responseContent = aiData.choices[0].message.content;
        
        // Try to parse the JSON from the AI response
        // Look for JSON in the response (it might have text around it)
        const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          extractedProperties = JSON.parse(jsonMatch[0]);
          console.log(`Successfully parsed ${extractedProperties.length} properties from AI response`);
        } else {
          console.log("No JSON array found in AI response, attempting to parse entire response");
          // If no clear JSON array is found, try to parse the whole response
          extractedProperties = JSON.parse(responseContent);
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.log("AI response content:", aiData.choices[0].message.content);
        
        // Create a fallback property if parsing fails
        extractedProperties = [{
          name: "Website Content",
          description: "Unable to extract structured data. Consider reviewing the website manually.",
          location: url,
          contact: {
            website: url
          }
        }];
      }
      
      // Clean up and normalize the extracted properties
      const normalizedProperties = normalizeProperties(extractedProperties);

      return new Response(
        JSON.stringify({ 
          success: true, 
          properties: normalizedProperties,
          rawData: aiData,
          endpoint: "GROQ API with Llama 3"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );

    } catch (fetchError) {
      console.error("Error fetching website:", fetchError.message);
      throw new Error(`Failed to fetch website content: ${fetchError.message}`);
    }
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

// Helper function to extract main content from HTML to reduce token usage
function extractMainContent(html: string): string {
  // Try to find and extract content from main sections that likely contain property data
  const mainContentRegexes = [
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*property[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]*>([\s\S]*?)<\/section>/i
  ];
  
  // Try each regex pattern to find the main content
  for (const regex of mainContentRegexes) {
    const match = html.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // If no specific section matches, remove script and style tags to reduce noise
  let cleanedHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
  
  // Extract only the body content if possible
  const bodyMatch = cleanedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    return bodyMatch[1];
  }
  
  // Return a shortened version of the cleaned HTML
  return cleanedHtml.length > 20000 ? cleanedHtml.substring(0, 20000) : cleanedHtml;
}

// Helper function to normalize the extracted properties
function normalizeProperties(properties: any[]): ExtractedProperty[] {
  return properties.map(property => {
    return {
      name: normalizeText(property.name),
      description: normalizeText(property.description),
      location: normalizeText(property.location),
      price: normalizeText(property.price),
      activities: normalizeArray(property.activities),
      image: normalizeUrl(property.image),
      contact: {
        phone: normalizeText(property.contact?.phone),
        email: normalizeText(property.contact?.email),
        website: normalizeUrl(property.contact?.website)
      }
    };
  });
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
