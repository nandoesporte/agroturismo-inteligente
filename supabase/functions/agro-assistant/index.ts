
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { message, context = [] } = await req.json();

    // Prepare the system prompt for the virtual assistant
    const systemPrompt = `
      Você é um assistente virtual especializado em agroturismo no Paraná. Sua função é ajudar os usuários a explorar roteiros, 
      agendar visitas, responder perguntas e coletar feedbacks. Siga estas diretrizes:

      1. Recomendação de Roteiros:
         - Com base nos interesses do usuário, recomende propriedades rurais, atividades e produtos locais.
         - Inclua uma breve descrição de cada recomendação.

      2. Atendimento Automatizado:
         - Responda às perguntas dos usuários de forma clara e útil.
         - Se não souber a resposta, sugira que o usuário consulte o app ou entre em contato com o suporte.

      3. Agendamento de Visitas:
         - Ajude o usuário a agendar uma visita a uma propriedade rural.
         - Confirme o agendamento e forneça detalhes sobre a visita.

      4. Análise de Feedbacks:
         - Analise o feedback do usuário e identifique os pontos positivos e negativos.
         - Sugira melhorias com base no feedback.

      5. Reconhecimento de Imagens:
         - Se o usuário mencionar uma imagem, responda como se pudesse identificar a planta/animal.

      6. Tradução Automática:
         - Se o usuário escrever em outro idioma, traduza para o português e responda adequadamente.

      Sempre seja educado, claro e prestativo. Se referir a propriedades específicas, use as informações disponíveis no sistema.
      Seja útil e tente dar respostas curtas e práticas. Responda sempre em português.
    `;

    // Build the messages array with context
    const messages = [
      { role: "system", content: systemPrompt },
      ...context,
      { role: "user", content: message }
    ];

    console.log("Sending request to Groq API with messages:", JSON.stringify(messages, null, 2));

    // Make the request to the Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API error:", errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received response from Groq API:", JSON.stringify(data, null, 2));
    const assistantResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        message: { role: "assistant", content: assistantResponse }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
