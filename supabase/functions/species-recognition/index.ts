
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
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error("Missing GROQ API key");
    }

    // Get the raw request body to avoid parsing issues
    const contentType = req.headers.get("content-type") || "";
    let imageBase64 = "";
    
    if (contentType.includes("application/json")) {
      try {
        // Handle JSON payload
        const body = await req.json();
        if (!body || !body.image) {
          throw new Error("No image data provided in the JSON payload");
        }
        
        imageBase64 = body.image.replace(/^data:image\/[a-z]+;base64,/, "");
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        throw new Error("Invalid JSON format: " + jsonError.message);
      }
    } else {
      // Attempt to parse FormData
      try {
        const formData = await req.formData();
        const imageFile = formData.get('image');
        
        if (!imageFile || !(imageFile instanceof File)) {
          throw new Error("No valid image file provided");
        }

        // Convert image to base64
        const imageBytes = await imageFile.arrayBuffer();
        imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));
      } catch (formError) {
        console.error("Form data parsing error:", formError.message);
        throw new Error("Could not process the image data. Please try a different format or image.");
      }
    }

    if (!imageBase64) {
      throw new Error("No image data was provided");
    }

    const dataUri = `data:image/jpeg;base64,${imageBase64}`;

    // First, use LLaVA or similar vision model to identify the species
    console.log("Sending image to vision model for species identification");
    const visionResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system", 
            content: "You are an expert biologist specializing in species identification. You will be shown an image of a plant or animal. Your task is to identify the species as accurately as possible. Provide ONLY the scientific name and common name in your response. Do not include any additional information or explanations."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "What species is shown in this image? Provide only the scientific name and common name." },
              { type: "image_url", image_url: { url: dataUri } }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 150
      })
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("Vision API error:", errorText);
      throw new Error(`Vision API error: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json();
    const speciesIdentification = visionData.choices[0].message.content;
    console.log("Species identified:", speciesIdentification);

    // Now, use the species information to generate a detailed description
    console.log("Generating detailed description");
    const descriptionResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system", 
            content: "Você é um especialista em agroturismo e biodiversidade brasileira. Forneça informações detalhadas sobre espécies em português, incluindo habitat, características, importância ecológica e curiosidades relevantes para agroturismo no Brasil. Suas respostas devem ser informativas, educacionais e úteis para visitantes de propriedades rurais no Paraná."
          },
          {
            role: "user",
            content: `Forneça uma descrição detalhada da seguinte espécie identificada: ${speciesIdentification}. Inclua informações sobre habitat, características físicas, comportamento (se for animal) ou ciclo de vida (se for planta), importância ecológica, relação com agroturismo e práticas sustentáveis, e curiosidades interessantes. Formate a resposta de forma organizada e educativa para visitantes de propriedades rurais.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!descriptionResponse.ok) {
      const errorText = await descriptionResponse.text();
      console.error("Description API error:", errorText);
      throw new Error(`Description API error: ${descriptionResponse.status}`);
    }

    const descriptionData = await descriptionResponse.json();
    const detailedDescription = descriptionData.choices[0].message.content;

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
