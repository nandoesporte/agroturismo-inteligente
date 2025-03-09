
// Import from a newer version of the Deno standard library
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    console.log("Request received for species recognition");
    
    // Enhanced request body handling with more robust checks
    let imageBase64 = "";
    let requestBody;
    
    try {
      // Check content-type header and process appropriately
      const contentType = req.headers.get("content-type") || "";
      console.log("Content type:", contentType);
      
      if (contentType.includes("application/json")) {
        // Get the request body as JSON
        try {
          requestBody = await req.json();
          console.log("JSON request body received, structure:", Object.keys(requestBody));
        } catch (parseError) {
          console.error("JSON parse error:", parseError.message);
          throw new Error(`Invalid JSON format: ${parseError.message}`);
        }
        
        if (!requestBody || !requestBody.image) {
          console.error("Missing image data in request body");
          throw new Error("Missing image data in request");
        }
        
        // Handle both formats: with or without data:image prefix
        imageBase64 = requestBody.image.includes("data:image") 
          ? requestBody.image.split(",")[1] 
          : requestBody.image;
          
        console.log("Image data extracted, length:", imageBase64.length);
      } else {
        console.error("Unsupported content type:", contentType);
        throw new Error(`Unsupported content type: ${contentType}. Expected application/json`);
      }
    } catch (bodyError) {
      console.error("Body processing error:", bodyError.message);
      throw bodyError;
    }
    
    if (!imageBase64 || imageBase64.length < 100) {
      console.error("Invalid image data, length:", imageBase64?.length || 0);
      throw new Error("Invalid image data. Please provide a valid base64 encoded image");
    }
    
    console.log("Image data prepared for processing, length:", imageBase64.length);
    const dataUri = `data:image/jpeg;base64,${imageBase64}`;

    // Step 1: Use OpenAI GPT-3.5-turbo with vision capabilities to identify the species
    console.log("Sending image to OpenAI for species identification");
    const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um biólogo especialista em identificação de espécies com foco em biodiversidade brasileira. Analise a descrição detalhada da imagem e identifique a espécie com a maior precisão possível. Forneça APENAS o nome científico (em itálico) e o nome popular em português do Brasil. Responda no formato 'Nome científico (Nome popular)'. Se não conseguir identificar com certeza, indique a família ou gênero mais provável e mencione características visíveis importantes para identificação."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identifique esta espécie com o formato solicitado:"
              },
              {
                type: "image_url",
                image_url: {
                  url: dataUri
                }
              }
            ]
          }
        ],
        max_tokens: 150,
        temperature: 0.1
      })
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("Species identification API error:", visionResponse.status, errorText);
      throw new Error(`Species identification API error: ${visionResponse.status}. ${errorText}`);
    }

    const visionData = await visionResponse.json();
    console.log("Vision API response structure:", Object.keys(visionData));
    
    // Extract the species identification from the response with better error handling
    let speciesIdentification = "";
    try {
      if (visionData.choices && visionData.choices.length > 0) {
        speciesIdentification = visionData.choices[0].message.content.trim();
        console.log("Species identified:", speciesIdentification);
      } else if (visionData.error) {
        throw new Error(`API error: ${visionData.error.message || JSON.stringify(visionData.error)}`);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error extracting species identification:", error);
      speciesIdentification = "Espécie não identificada. Por favor, tente com uma imagem mais clara.";
    }

    // Step 2: Generate detailed description using GPT-3.5-Turbo
    console.log("Generating detailed description using GPT-3.5-Turbo");
    const descriptionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system", 
            content: "Você é um especialista em agroturismo e biodiversidade brasileira. Forneça informações detalhadas sobre espécies em português, incluindo habitat, características, importância ecológica e curiosidades relevantes para agroturismo no Brasil. Suas respostas devem ser informativas, educacionais e úteis para visitantes de propriedades rurais no Paraná."
          },
          {
            role: "user",
            content: `Forneça uma descrição detalhada da seguinte espécie identificada: ${speciesIdentification}. Inclua informações sobre habitat, características físicas, comportamento (se for animal) ou ciclo de vida (se for planta), importância ecológica, relação com agroturismo e práticas sustentáveis, e curiosidades interessantes. Formate a resposta de forma organizada com títulos para cada seção.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!descriptionResponse.ok) {
      const errorText = await descriptionResponse.text();
      console.error("Description API error:", descriptionResponse.status, errorText);
      throw new Error(`Description API error: ${descriptionResponse.status}. ${errorText}`);
    }

    const descriptionData = await descriptionResponse.json();
    const detailedDescription = descriptionData.choices[0].message.content;
    console.log("Description generated successfully");

    // Step 3: Return the results to the web app
    return new Response(
      JSON.stringify({ 
        species: speciesIdentification,
        description: detailedDescription
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ 
        error: "Houve um problema ao processar sua imagem. Por favor, tente novamente.",
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
