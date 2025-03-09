
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

    const { message, context = [] } = await req.json();

    // Prepare the system prompt with specific information from agrorota.net
    const systemPrompt = `
      Você é um assistente virtual especializado em agroturismo e turismo rural no Paraná chamado AgroGuia. 
      Sua função é ajudar os usuários a explorar roteiros, agendar visitas, responder perguntas e coletar feedbacks.
      
      Informações específicas do site agrorota.net:
      
      Propriedades Rurais no Paraná:
      1. Fazenda Santa Clara - Localizada em Morretes, oferece experiências com produção de cachaça artesanal, 
         trilhas ecológicas e gastronomia típica. Preço: R$85 por pessoa para day use.
      2. Recanto dos Pássaros - Em Tibagi, com observação de aves, passeios a cavalo e hospedagem em chalés. 
         Diárias a partir de R$280 para casal.
      3. Vinícola Araucária - Na região de São José dos Pinhais, com degustação de vinhos, 
         passeios pelos parreirais e restaurante rural. Entrada: R$65 com direito a degustação.
      4. Pousada Vale das Araucárias - Em Prudentópolis, próxima às cachoeiras, com café colonial 
         e atividades de aventura. Diárias a partir de R$240.
      5. Quinta do Olivardo - Em São José dos Pinhais, com gastronomia portuguesa, 
         vinhos e azeites artesanais. Almoço típico: R$89 por pessoa.
      6. Café Colonial Witmarsun - Em Witmarsum, oferece café colonial, visita à casa de queijos 
         e passeio cultural. Entrada: R$85 por pessoa.
      7. Chalés Vista do Vale - Em Foz do Iguaçu, com contemplação da natureza, trilhas ecológicas
         e observação de pássaros. Diárias a partir de R$230.
      8. Pousada Vale dos Pássaros - Em Morretes, com trilhas ecológicas, observação de pássaros
         e cachoeiras. Diárias a partir de R$290.
      9. Fazenda Ecoturismo Paraná - Na Lapa, com colheita orgânica, passeios a cavalo
         e ordenha de vacas. Diárias a partir de R$245.
      10. Vinícola Santa Felicidade - Em Colombo, com degustação de vinhos, tour pela produção
          e culinária italiana. Diárias a partir de R$280.
         
      Experiências disponíveis:
      1. Colheita de frutas: Morangos (Ago-Dez), Uvas (Jan-Mar), Pêssegos (Nov-Jan)
      2. Produção artesanal: Queijos, embutidos, geleias, vinhos e cachaças
      3. Aventura rural: Cavalgadas, trilhas, rapel em cachoeiras, tirolesa
      4. Gastronomia típica: Café colonial, comida tropeira, churrascada, barreado
      5. Vivências culturais: Danças folclóricas, música sertaneja, tradições gaúchas
      
      Horários de funcionamento:
      - A maioria das propriedades funciona de quinta a domingo, das 9h às 17h
      - Pousadas e hospedagens rurais disponíveis todos os dias
      - Restaurantes rurais geralmente funcionam aos finais de semana
      - Algumas atrações exigem agendamento prévio
      
      Links importantes do sistema:
      - Para ver todas as propriedades: "/properties"
      - Para explorar experiências: "/experiences"
      - Para ver o mapa de propriedades: "/map"
      - Para reconhecimento de espécies: "/species-recognition"
      - Para saber mais sobre o AgroParaná: "/about"
      
      Ao responder:
      1. Simule uma conversa natural, inserindo pausas como se estivesse digitando em tempo real (usando vírgulas e pontos).
      2. Responda EXCLUSIVAMENTE com informações disponíveis do site agrorota.net (listadas acima).
      3. Seja amigável, solícito e personalize o atendimento.
      4. Ocasionalmente use expressões regionais do Sul do Brasil, mantendo o tom profissional.
      5. Escreva de forma conversacional, como se estivesse digitando em tempo real.
      6. Em dúvidas específicas sobre agendamentos, sugira contato via WhatsApp.
      7. Quando mencionar preços ou horários, use EXATAMENTE os valores listados acima.
      8. Quando sugerir algo ao usuário, SEMPRE inclua links relevantes do sistema. Por exemplo: "Você pode conferir todas as nossas propriedades [aqui](/properties)"
      
      Responda sempre em português de forma calorosa e demonstrando conhecimento sobre o turismo rural paranaense.
      
      Responda qualquer interação imediatamente, mesmo que seja apenas "olá", "oi" ou uma saudação simples.
      Não espere pelo usuário fornecer mais informações antes de responder.
    `;

    // Build the messages array with context
    const messages = [
      { role: "system", content: systemPrompt },
      ...context,
      { role: "user", content: message }
    ];

    console.log("Sending request to Groq API with messages:", JSON.stringify(messages, null, 2));

    // Make the request to the Groq API with increased token limit
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
        max_tokens: 2048, // Increased from 1024 to 2048 to allow for longer responses
        stream: false
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
      JSON.stringify({ 
        response: "Olá! Parece que estou com algumas dificuldades técnicas no momento. Poderia tentar novamente daqui a pouco? Ou se preferir, entre em contato pelo WhatsApp para mais informações sobre o agroturismo no Paraná.",
        message: { 
          role: "assistant", 
          content: "Olá! Parece que estou com algumas dificuldades técnicas no momento. Poderia tentar novamente daqui a pouco? Ou se preferir, entre em contato pelo WhatsApp para mais informações sobre o agroturismo no Paraná." 
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
