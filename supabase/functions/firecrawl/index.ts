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
      const mainContent = extractMainContent(htmlContent);
      
      // Truncate content to stay within token limits
      const truncatedContent = mainContent.length > 10000 
        ? mainContent.substring(0, 10000) + "..." 
        : mainContent;
      
      console.log(`Reduced content to ${truncatedContent.length} bytes`);
      
      // Create a specialized prompt for the AI to extract structured data with our specific fields
      const prompt = `
        Você é um especialista em extração de dados. O seu trabalho é analisar o conteúdo de sites de turismo rural e propriedades rurais para extrair informações estruturadas.
        
        Extraia até 5 propriedades ou experiências que você encontrar. Para cada uma, forneça APENAS os seguintes campos:
        1. Nome (string): Nome da propriedade/experiência
        2. Localização (string): Localização da propriedade (cidade, estado)
        3. Preço (string): Informação de preço exatamente como aparece (com símbolo de moeda se presente)
        4. Image (string): URL da imagem principal da propriedade
        5. Atividades (array de strings): Lista de até 5 atividades disponíveis
        6. Comodidades (array de strings): Lista de até 5 comodidades como Wi-Fi, Estacionamento, etc.
        7. Horário de Funcionamento (string): Informação sobre horários de funcionamento
        8. Informações de contato:
           - Telefone (string): Número de telefone
           - Email (string): Endereço de e-mail
           - Website (string): URL do site

        Formate sua resposta como um JSON válido com exatamente esses nomes de campos:
        [
          {
            "name": "Nome da Propriedade",
            "location": "Detalhes da localização",
            "price": "Informação de preço", 
            "image": "url da imagem",
            "activities": ["atividade1", "atividade2"],
            "amenities": ["comodidade1", "comodidade2"],
            "hours": "Informação sobre horários",
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
            { role: "user", content: prompt + "\n\nHere is the content to extract from:\n\n" + truncatedContent }
          ],
          temperature: 0.2, // Lower temperature for more consistent structured output
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
      amenities: normalizeArray(property.amenities),
      hours: normalizeText(property.hours),
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
