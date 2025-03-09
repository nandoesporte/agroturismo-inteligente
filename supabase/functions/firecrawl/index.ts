
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
  amenities?: string[];
  hours?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  image?: string;
  images?: string[];
  type?: string;
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
      console.error("Missing GROQ API key in environment variables");
      throw new Error("Missing GROQ API key");
    }

    const { url } = await req.json();
    
    if (!url) {
      console.error("URL is required but was not provided");
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Extracting data from URL: ${url}`);

    // First, fetch the HTML content of the website with better error handling
    try {
      console.log(`Fetching content from URL: ${url}`);
      
      // Add timeout and better error handling for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout - increased
      
      const fetchResponse = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).catch(error => {
        console.error(`Fetch error: ${error.message}`);
        clearTimeout(timeoutId);
        throw new Error(`Failed to fetch website content: ${error.message}`);
      });
      
      clearTimeout(timeoutId);
      
      if (!fetchResponse.ok) {
        console.error(`HTTP error: ${fetchResponse.status} ${fetchResponse.statusText}`);
        throw new Error(`Failed to fetch URL content: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }
      
      const htmlContent = await fetchResponse.text();
      console.log(`Successfully fetched ${htmlContent.length} bytes of HTML content`);
      
      // Extract only the main content to reduce token usage
      const mainContent = extractMainContent(htmlContent);
      
      // Truncate content to stay within token limits - reducing even further to avoid overloading the model
      const truncatedContent = mainContent.length > 10000 
        ? mainContent.substring(0, 10000) + "..." 
        : mainContent;
      
      console.log(`Reduced content to ${truncatedContent.length} bytes`);
      
      // Create a specialized prompt for the AI to extract property data
      const prompt = `
        Você é um especialista em extração de dados especializado em propriedades de hospedagem e turismo rural no Paraná, Brasil. Sua tarefa é extrair informações de propriedades a partir do conteúdo HTML fornecido.
        
        Extraia até 10 propriedades/hospedagens que você encontrar. Para cada uma, forneça APENAS os seguintes campos:
        1. Nome (string): Nome da propriedade/pousada/hotel
        2. Localização (string): Localização da propriedade, preferencialmente no Paraná
        3. Preço (string): Informação de preço exatamente como aparece (com símbolo de moeda)
        4. Image (string): URL da imagem principal da propriedade
        5. Images (array de strings): URLs de imagens adicionais da propriedade
        6. Atividades (array de strings): Lista de atividades disponíveis
        7. Comodidades (array de strings): Lista de comodidades como Wi-Fi, Estacionamento, etc.
        8. Tipo (string): Categorize como 'Agroturismo', 'Turismo Rural', 'Fazenda', 'Chalé', 'Café Colonial', ou 'Pousada Rural'
        9. Informações de contato:
           - Telefone (string): Número de telefone
           - Email (string): Endereço de e-mail
           - Website (string): URL do site

        Formate sua resposta como um JSON válido com exatamente esses nomes de campos:
        [
          {
            "name": "Nome da Propriedade",
            "location": "Cidade, Estado",
            "price": "Informação de preço", 
            "image": "url da imagem",
            "images": ["url1", "url2"],
            "activities": ["atividade1", "atividade2"],
            "amenities": ["comodidade1", "comodidade2"],
            "hours": "Informação sobre horários",
            "type": "Categoria da propriedade",
            "contact": {
              "phone": "número de telefone",
              "email": "endereço de email",
              "website": "url do website"
            }
          }
        ]
        
        Responda apenas com o JSON. Não inclua explicações antes ou depois do JSON.
      `;
      
      console.log("Sending request to GROQ API for extraction");
      
      // Make the request to the Groq API with Llama model - with better error handling
      const groqController = new AbortController();
      const groqTimeoutId = setTimeout(() => groqController.abort(), 100000); // 100 second timeout - increased
      
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              { role: "user", content: prompt + "\n\nHere is the content to extract from:\n\n" + truncatedContent }
            ],
            temperature: 0.2, // Lower temperature for more consistent structured output
            max_tokens: 4000  // Increased to allow for more properties
          }),
          signal: groqController.signal
        });
        
        clearTimeout(groqTimeoutId);

        if (!groqResponse.ok) {
          const errorData = await groqResponse.text();
          console.error(`GROQ API error (${groqResponse.status}): ${errorData}`);
          throw new Error(`GROQ API error: ${groqResponse.status} - ${errorData.substring(0, 200)}`);
        }

        const aiData = await groqResponse.json();
        console.log("Received response from GROQ API");
        
        let extractedProperties: ExtractedProperty[] = [];
        
        try {
          // Extract the JSON part from the AI response with more robust parsing
          const responseContent = aiData.choices[0].message.content;
          console.log(`Raw AI response: ${responseContent.substring(0, 200)}...`);
          
          // More robust JSON extraction using different patterns
          let jsonText = '';
          
          // Try different extraction methods
          // Method 1: Look for a JSON array pattern
          const jsonMatch = responseContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
            console.log("Extracted JSON using array pattern match");
          } 
          // Method 2: Look for content between triple backticks
          else {
            const codeBlockMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch && codeBlockMatch[1]) {
              jsonText = codeBlockMatch[1];
              console.log("Extracted JSON using code block pattern match");
            } else {
              // Method 3: Use the entire content if it looks like JSON
              if (responseContent.trim().startsWith('[') && responseContent.trim().endsWith(']')) {
                jsonText = responseContent;
                console.log("Using entire response as JSON");
              }
            }
          }
          
          if (jsonText) {
            try {
              extractedProperties = JSON.parse(jsonText);
              console.log(`Successfully parsed ${extractedProperties.length} properties from AI response`);
            } catch (parseError) {
              console.error(`Error parsing extracted JSON: ${parseError.message}`);
              console.log(`Problematic JSON text: ${jsonText.substring(0, 100)}...`);
              
              // Try to clean the JSON before parsing
              const cleanedJson = jsonText
                .replace(/\\'/g, "'")
                .replace(/\\"/g, '"')
                .replace(/\\&/g, '&')
                .replace(/\\r/g, '')
                .replace(/\\n/g, '')
                .replace(/\\t/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              
              try {
                extractedProperties = JSON.parse(cleanedJson);
                console.log(`Successfully parsed ${extractedProperties.length} properties after cleaning JSON`);
              } catch (cleanParseError) {
                console.error(`Error parsing cleaned JSON: ${cleanParseError.message}`);
                console.log(`Cleaned JSON: ${cleanedJson.substring(0, 100)}...`);
                
                // Try parsing individual objects
                try {
                  const objectPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
                  const matches = cleanedJson.match(objectPattern) || [];
                  console.log(`Found ${matches.length} potential JSON objects`);
                  
                  extractedProperties = matches
                    .map(objStr => {
                      try {
                        return JSON.parse(objStr);
                      } catch (e) {
                        console.error(`Failed to parse object: ${objStr.substring(0, 50)}...`);
                        return null;
                      }
                    })
                    .filter(Boolean) as ExtractedProperty[];
                  
                  console.log(`Successfully parsed ${extractedProperties.length} individual objects`);
                } catch (objectParseError) {
                  console.error(`Error parsing individual objects: ${objectParseError.message}`);
                  throw new Error("Failed to parse AI response as JSON");
                }
              }
            }
          } else {
            console.error("No JSON pattern found in the AI response");
            throw new Error("No valid JSON found in AI response");
          }
        } catch (parseError) {
          console.error(`Error parsing AI response: ${parseError.message}`);
          
          // Create fallback properties if parsing fails
          // Use a more robust fallback strategy
          try {
            // Try to extract any JSON objects from the response
            const content = aiData.choices[0].message.content;
            const jsonObjects = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
            
            if (jsonObjects && jsonObjects.length > 0) {
              // Try to extract individual properties
              extractedProperties = jsonObjects.map(jsonStr => {
                try {
                  return JSON.parse(jsonStr);
                } catch (e) {
                  return null;
                }
              }).filter(Boolean) as ExtractedProperty[];
              
              console.log(`Extracted ${extractedProperties.length} properties using fallback method`);
            }
            
            // If still no properties, provide a generic fallback
            if (extractedProperties.length === 0) {
              extractedProperties = [{
                name: "Website Content",
                description: "Unable to extract structured data. Consider reviewing the website manually.",
                location: url,
                contact: {
                  website: url
                }
              }];
              console.log("Created generic fallback property due to parsing issues");
            }
          } catch (fallbackError) {
            console.error(`Fallback parsing also failed: ${fallbackError.message}`);
            extractedProperties = [{
              name: "Website Content",
              description: "Unable to extract structured data. Consider reviewing the website manually.",
              location: url,
              contact: {
                website: url
              }
            }];
            console.log("Created generic fallback property due to complete parsing failure");
          }
        }
        
        // Normalize the extracted properties
        const normalizedProperties = normalizeProperties(extractedProperties);
        console.log(`Returning ${normalizedProperties.length} normalized properties`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            properties: normalizedProperties,
            endpoint: "GROQ API with Llama 3"
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } catch (groqError) {
        clearTimeout(groqTimeoutId);
        console.error(`GROQ API request failed: ${groqError.message}`);
        
        // Provide a more specific error response
        if (groqError.name === 'AbortError') {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "GROQ API request timed out after 100 seconds" 
            }),
            { 
              status: 504, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `GROQ API error: ${groqError.message}` 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

    } catch (fetchError) {
      console.error(`Error fetching website: ${fetchError.message}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to fetch website content: ${fetchError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error(`General error: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `An unexpected error occurred: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

// Helper function to extract main content from HTML to reduce token usage
function extractMainContent(html: string): string {
  try {
    // Focus on product listings and accommodations
    const accommodationRegexes = [
      /<div[^>]*class="[^"]*accommodation-list[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*hotel-list[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*property-list[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*search-results[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*class="[^"]*listings[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
      /<ul[^>]*class="[^"]*property-list[^"]*"[^>]*>([\s\S]*?)<\/ul>/i,
      /<div[^>]*id="[^"]*results[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<section[^>]*>([\s\S]*?)<\/section>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*container[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    ];
    
    // Try each regex pattern to find the main content
    for (const regex of accommodationRegexes) {
      const match = html.match(regex);
      if (match && match[1]) {
        console.log(`Matched content using pattern: ${regex.toString().substring(0, 30)}...`);
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
    
    console.log("No specific content area matched, using cleaned HTML");
    
    // Extract only the body content if possible
    const bodyMatch = cleanedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      console.log("Extracted body content");
      return bodyMatch[1];
    }
    
    // Return a shortened version of the cleaned HTML
    console.log("Using shortened cleaned HTML");
    return cleanedHtml.length > 15000 ? cleanedHtml.substring(0, 15000) : cleanedHtml;
  } catch (error) {
    console.error(`Error extracting main content: ${error.message}`);
    return html.length > 10000 ? html.substring(0, 10000) : html;
  }
}

// Helper function to normalize the extracted properties
function normalizeProperties(properties: any[]): ExtractedProperty[] {
  if (!Array.isArray(properties)) {
    console.error("Properties is not an array:", properties);
    return [];
  }
  
  return properties.map(property => {
    if (!property) return {};
    
    try {
      // Verify required fields exist
      if (!property.name && !property.location) {
        console.log("Skipping property without name or location");
        return {};
      }
      
      return {
        name: normalizeText(property.name),
        description: normalizeText(property.description),
        location: normalizeText(property.location),
        price: normalizeText(property.price),
        activities: normalizeArray(property.activities),
        amenities: normalizeArray(property.amenities),
        hours: normalizeText(property.hours),
        image: normalizeUrl(property.image),
        images: Array.isArray(property.images) ? property.images.map(normalizeUrl).filter(Boolean) : [],
        type: normalizeText(property.type || 'Turismo Rural'),
        contact: {
          phone: normalizeText(property.contact?.phone),
          email: normalizeText(property.contact?.email),
          website: normalizeUrl(property.contact?.website)
        }
      };
    } catch (e) {
      console.error("Error normalizing property:", e);
      return {};
    }
  }).filter(p => Object.keys(p).length > 0 && p.name);
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
