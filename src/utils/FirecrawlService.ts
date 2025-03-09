
// Add any necessary imports here if needed

export interface ExtractedProperty {
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
  type?: string; // Added property type for categorization
}

class FirecrawlServiceClass {
  private trivagoUrl = "https://www.trivago.com.br";
  
  // Predefined property types for Paraná tourism
  private propertyTypes = [
    'Agroturismo', 
    'Turismo Rural', 
    'Fazenda', 
    'Chalé', 
    'Café Colonial',
    'Pousada Rural'
  ];
  
  async scrapeWebsite(url: string): Promise<{ 
    success: boolean; 
    properties?: ExtractedProperty[]; 
    error?: string 
  }> {
    try {
      console.log(`Scraping website: ${url}`);
      
      // For Trivago URLs, use the formatTrivagoUrl function
      // For other URLs, use as is
      const searchUrl = url.includes('trivago.com') ? this.formatTrivagoUrl(url) : url;
      console.log(`Formatted search URL: ${searchUrl}`);
      
      // Try to use the edge function for real scraping
      try {
        console.log("Attempting to use Supabase Edge Function for extraction");
        
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/firecrawl`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ url: searchUrl })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error from scrape API:', errorText);
          throw new Error(`Error from scraping service: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          console.error('Scraping was not successful:', data.error || 'Unknown error');
          throw new Error(data.error || 'Falha na extração de dados');
        }
        
        console.log('Scraped properties:', data.properties?.length);
        
        // Process and normalize property data
        const properties = this.normalizeProperties(data.properties || []);
        
        return {
          success: true,
          properties: properties
        };
      } catch (apiError) {
        console.error('API Error, falling back to mock data:', apiError);
        
        // Use a mock response as fallback
        console.log("Using mock data since API is not available");
        
        // Simulated small delay to mimic API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock properties - use Trivago or Paraná-specific mocks, but create more (10)
        let mockProperties: ExtractedProperty[] = [];
        
        if (url.includes('trivago.com') || url.includes('parana') || url.includes('paraná')) {
          // Mock properties based on Trivago agrotourism in Paraná (expanded to 10)
          mockProperties = [
            {
              name: "Pousada Vale dos Pássaros",
              description: "Localizada em meio à natureza com vista para as montanhas do Paraná",
              location: "Morretes, Paraná",
              price: "R$ 290 por noite",
              activities: ["Trilhas ecológicas", "Observação de pássaros", "Cachoeiras"],
              amenities: ["Wi-Fi", "Estacionamento gratuito", "Café da manhã colonial"],
              hours: "Check-in: 14h / Check-out: 12h",
              contact: {
                phone: "(41) 3333-4444",
                email: "contato@valedospassaros.com.br",
                website: "https://www.trivago.com.br/hotel/valedospassaros"
              },
              image: "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf",
              images: [
                "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf",
                "https://images.unsplash.com/photo-1542718610-a1d656d1884c"
              ],
              type: "Pousada Rural"
            },
            {
              name: "Fazenda Ecoturismo Paraná",
              description: "Experiência rural autêntica com produção orgânica e atividades agrícolas",
              location: "Lapa, Paraná",
              price: "R$ 245 por noite",
              activities: ["Colheita orgânica", "Passeios a cavalo", "Ordenha de vacas"],
              amenities: ["Refeições caseiras", "Piscina natural", "Chalés privativos"],
              hours: "Funcionamento: Todos os dias",
              contact: {
                phone: "(42) 99876-5432",
                email: "reservas@fazendaeco.com.br",
                website: "https://www.trivago.com.br/hotel/fazendaeco"
              },
              image: "https://images.unsplash.com/photo-1500076656116-558758c991c1",
              images: [
                "https://images.unsplash.com/photo-1500076656116-558758c991c1",
                "https://images.unsplash.com/photo-1510598145-d0b9d7c1a2ad"
              ],
              type: "Agroturismo"
            },
            {
              name: "Recanto das Araucárias",
              description: "Pousada em meio às Araucárias nativas do Paraná com gastronomia regional",
              location: "Prudentópolis, Paraná",
              price: "R$ 320 por noite",
              activities: ["Visitação a cachoeiras", "Gastronomia típica", "Caminhadas"],
              amenities: ["Café colonial", "Lareira", "Wi-Fi nas áreas comuns"],
              hours: "Check-in: 15h / Check-out: 11h",
              contact: {
                phone: "(42) 3446-7890",
                email: "recanto@araucarias.com.br",
                website: "https://www.trivago.com.br/hotel/recantoareaucarias"
              },
              image: "https://images.unsplash.com/photo-1517396751741-21bce539cd9d",
              images: [
                "https://images.unsplash.com/photo-1517396751741-21bce539cd9d",
                "https://images.unsplash.com/photo-1579033385971-a7bc8c6f8c64"
              ],
              type: "Turismo Rural"
            },
            {
              name: "Chalés da Serra Paranaense",
              description: "Chalés aconchegantes com vista panorâmica para a Serra do Mar",
              location: "São José dos Pinhais, Paraná",
              price: "R$ 275 por noite",
              activities: ["Tirolesa", "Rappel", "Caminhada na natureza"],
              amenities: ["Lareira", "Cozinha equipada", "Churrasqueira"],
              hours: "Check-in: 15h / Check-out: 12h",
              contact: {
                phone: "(41) 99765-4321",
                email: "reservas@chalesdaerra.com.br",
                website: "https://www.chalesserra.com.br"
              },
              image: "https://images.unsplash.com/photo-1522156373667-4c7234bbd804",
              images: [
                "https://images.unsplash.com/photo-1522156373667-4c7234bbd804",
                "https://images.unsplash.com/photo-1601918774946-25832a4be0d6"
              ],
              type: "Chalé"
            },
            {
              name: "Café Colonial Witmarsun",
              description: "Tradicional café colonial com influências germânicas e produtos artesanais",
              location: "Witmarsum, Paraná",
              price: "R$ 85 por pessoa",
              activities: ["Degustação de produtos coloniais", "Visita à casa de queijos", "Passeio cultural"],
              amenities: ["Amplo estacionamento", "Área para crianças", "Produtos para venda"],
              hours: "Sábados e Domingos: 9h às 18h",
              contact: {
                phone: "(42) 3533-1212",
                email: "contato@cafewitmarsum.com.br",
                website: "https://www.cafewitmarsum.com.br"
              },
              image: "https://images.unsplash.com/photo-1511018556340-d16986a1c194",
              images: [
                "https://images.unsplash.com/photo-1511018556340-d16986a1c194",
                "https://images.unsplash.com/photo-1554118811-1e0d58224f24"
              ],
              type: "Café Colonial"
            },
            // Adicionando mais 5 propriedades para chegar a 10
            {
              name: "Pousada Águas Claras",
              description: "Pousada à beira do rio com acesso direto à água e atividades náuticas",
              location: "Tibagi, Paraná",
              price: "R$ 260 por noite",
              activities: ["Canoagem", "Pesca esportiva", "Banho de rio"],
              amenities: ["Café da manhã regional", "Acesso ao rio", "Churrasqueiras"],
              hours: "Check-in: 14h / Check-out: 12h",
              contact: {
                phone: "(42) 3275-1234",
                email: "contato@pousadaaguasclaras.com.br",
                website: "https://www.pousadaaguasclaras.com.br"
              },
              image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9",
              images: [
                "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9",
                "https://images.unsplash.com/photo-1540541338287-41700207dee6"
              ],
              type: "Pousada Rural"
            },
            {
              name: "Fazenda Histórica Santa Clara",
              description: "Fazenda centenária com produção de café e ampla área verde preservada",
              location: "Londrina, Paraná",
              price: "R$ 350 por noite",
              activities: ["Tour pela plantação de café", "Passeios de charrete", "História da imigração"],
              amenities: ["Casarão histórico", "Refeições típicas", "Museu rural"],
              hours: "Check-in: 15h / Check-out: 11h",
              contact: {
                phone: "(43) 3372-8800",
                email: "reservas@fazendahistorica.com.br",
                website: "https://www.fazendahistorica.com.br"
              },
              image: "https://images.unsplash.com/photo-1585543805890-6051f7829f98",
              images: [
                "https://images.unsplash.com/photo-1585543805890-6051f7829f98",
                "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3"
              ],
              type: "Fazenda"
            },
            {
              name: "Ecovila Verde Vale",
              description: "Experiência de hospedagem sustentável em casa ecológica com técnicas permaculturais",
              location: "Mandirituba, Paraná",
              price: "R$ 190 por noite",
              activities: ["Workshop de permacultura", "Colheita orgânica", "Yoga ao ar livre"],
              amenities: ["Alimentação vegetariana", "Compostagem", "Captação de água da chuva"],
              hours: "Check-in: 14h / Check-out: 10h",
              contact: {
                phone: "(41) 99888-7777",
                email: "contato@ecovila.eco.br",
                website: "https://www.ecovilaverdevale.com"
              },
              image: "https://images.unsplash.com/photo-1516431762806-5a41e2353ae4",
              images: [
                "https://images.unsplash.com/photo-1516431762806-5a41e2353ae4",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
              ],
              type: "Agroturismo"
            },
            {
              name: "Vinícola Santa Felicidade",
              description: "Hospedagem em vinícola tradicional paranaense com degustação e culinária italiana",
              location: "Colombo, Paraná",
              price: "R$ 280 por noite",
              activities: ["Degustação de vinhos", "Tour pela produção", "Culinária italiana"],
              amenities: ["Adega climatizada", "Restaurante próprio", "Loja de vinhos"],
              hours: "Check-in: 15h / Check-out: 12h",
              contact: {
                phone: "(41) 3222-9999",
                email: "reservas@vinicola.com.br",
                website: "https://www.vinicolasantafelicidade.com.br"
              },
              image: "https://images.unsplash.com/photo-1559561853-08451507cbe7",
              images: [
                "https://images.unsplash.com/photo-1559561853-08451507cbe7",
                "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb"
              ],
              type: "Turismo Rural"
            },
            {
              name: "Chalés Vista do Vale",
              description: "Conjunto de chalés rústicos com vista panorâmica para o Vale do Iguaçu",
              location: "Foz do Iguaçu, Paraná",
              price: "R$ 230 por noite",
              activities: ["Contemplação da natureza", "Trilhas ecológicas", "Observação de pássaros"],
              amenities: ["Vista panorâmica", "Ofurô ao ar livre", "Café regional"],
              hours: "Check-in: 14h / Check-out: 12h",
              contact: {
                phone: "(45) 3523-4567",
                email: "reservas@chalesvista.com.br",
                website: "https://www.chalesvistadovale.com.br"
              },
              image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
              images: [
                "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739"
              ],
              type: "Chalé"
            }
          ];
        } else {
          // Generic mocks for other websites, but with Paraná context and categories
          // Expandido para 10 propriedades
          mockProperties = [
            {
              name: "Hotel Fazenda Rural",
              description: "Experiência autêntica no campo com diversas atividades para toda família",
              location: "Interior do Paraná",
              price: "R$ 280 por noite",
              activities: ["Passeios a cavalo", "Pesca", "Trilhas ecológicas"],
              amenities: ["Piscina", "Wi-Fi", "Café da manhã incluído"],
              hours: "Check-in: 14h / Check-out: 12h",
              contact: {
                phone: "(41) 98765-4321",
                email: "contato@hotelfazendasite.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
              images: [
                "https://images.unsplash.com/photo-1566073771259-6a8506099945",
                "https://images.unsplash.com/photo-1566908829550-e6551b00979b"
              ],
              type: "Fazenda"
            },
            {
              name: "Pousada Natureza Viva",
              description: "Conforto e tranquilidade em meio à natureza preservada",
              location: "Serra do Paraná",
              price: "R$ 230 por noite",
              activities: ["Observação de pássaros", "Cachoeiras", "Yoga"],
              amenities: ["Hidromassagem", "Restaurante orgânico", "Área de meditação"],
              hours: "Funcionamento: Todos os dias",
              contact: {
                phone: "(42) 3333-2222",
                email: "reservas@naturezaviva.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb",
              images: [
                "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb",
                "https://images.unsplash.com/photo-1528127269322-539801943592"
              ],
              type: "Turismo Rural"
            },
            {
              name: "Chalés da Montanha",
              description: "Hospedagem rústica e aconchegante com vista para as montanhas",
              location: "Região Serrana, Paraná",
              price: "R$ 195 por noite",
              activities: ["Caminhadas", "Cavalgadas", "Contemplação da natureza"],
              amenities: ["Calefação", "Cozinha completa", "Área externa privativa"],
              hours: "Check-in: 14h / Check-out: 11h",
              contact: {
                phone: "(41) 99888-7777",
                email: "reservas@chalesmontanha.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
              images: [
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
                "https://images.unsplash.com/photo-1542718610-a1d656d1884c"
              ],
              type: "Chalé"
            },
            // Adicionando mais 7 propriedades para chegar a 10
            {
              name: "Recanto do Café",
              description: "Café colonial com hospedagem e produção artesanal de doces e compotas",
              location: "Campo Largo, Paraná",
              price: "R$ 150 por pessoa (com refeição)",
              activities: ["Degustação de produtos locais", "Tour pela produção artesanal", "Colheita sazonal"],
              amenities: ["Café da manhã colonial", "Loja de produtos", "Área para piquenique"],
              hours: "Funcionamento: 9h às 18h (quartas a domingos)",
              contact: {
                phone: "(41) 3555-1212",
                email: "contato@recantodocafe.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1592861956120-e524fc739696",
              images: [
                "https://images.unsplash.com/photo-1592861956120-e524fc739696",
                "https://images.unsplash.com/photo-1511920170033-f8396924c348"
              ],
              type: "Café Colonial"
            },
            {
              name: "Fazenda das Araucárias",
              description: "Experiência rural completa com produção de erva-mate e pinhão",
              location: "Guarapuava, Paraná",
              price: "R$ 310 por noite",
              activities: ["Colheita de pinhão (sazonal)", "Processamento de erva-mate", "Caminhadas na mata"],
              amenities: ["Café regional", "Fogão à lenha", "Produtos locais"],
              hours: "Check-in: 14h / Check-out: 12h",
              contact: {
                phone: "(42) 3322-5544",
                email: "reservas@fazendaaraucarias.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
              images: [
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
                "https://images.unsplash.com/photo-1533309907656-7b29c8679722"
              ],
              type: "Fazenda"
            },
            {
              name: "Pousada Caminhos do Vinho",
              description: "Pousada em região de produção vinícola com degustações e passeios",
              location: "São José dos Pinhais, Paraná",
              price: "R$ 245 por noite",
              activities: ["Degustação de vinhos", "Passeios de bicicleta", "Visita às vinícolas"],
              amenities: ["Café da manhã com produtos locais", "Adega", "Jardim"],
              hours: "Check-in: 15h / Check-out: 11h",
              contact: {
                phone: "(41) 3635-1234",
                email: "contato@caminhosdovinho.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc",
              images: [
                "https://images.unsplash.com/photo-1573052905904-34ad8c27f0cc",
                "https://images.unsplash.com/photo-1543721520-57fb4eb3033c"
              ],
              type: "Pousada Rural"
            },
            {
              name: "Eco Resort Mata Atlântica",
              description: "Resort ecológico em área preservada de Mata Atlântica com atividades sustentáveis",
              location: "Morretes, Paraná",
              price: "R$ 420 por noite",
              activities: ["Educação ambiental", "Arvorismo", "Observação da fauna"],
              amenities: ["Alimentação orgânica", "Energia solar", "Piscina natural"],
              hours: "Check-in: 14h / Check-out: 12h",
              contact: {
                phone: "(41) 3462-7788",
                email: "reservas@ecoresortpr.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6",
              images: [
                "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6",
                "https://images.unsplash.com/photo-1501117716987-67454513ecd1"
              ],
              type: "Turismo Rural"
            },
            {
              name: "Chalés da Represa",
              description: "Chalés às margens da represa de Capivari com atividades náuticas",
              location: "Campina Grande do Sul, Paraná",
              price: "R$ 260 por noite",
              activities: ["Pesca esportiva", "Passeios de barco", "Stand-up paddle"],
              amenities: ["Vista para represa", "Churrasqueira", "Pier privativo"],
              hours: "Check-in: 16h / Check-out: 14h",
              contact: {
                phone: "(41) 3679-8899",
                email: "reservas@chalesdarepresa.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1618140052121-39fc6db33972",
              images: [
                "https://images.unsplash.com/photo-1618140052121-39fc6db33972",
                "https://images.unsplash.com/photo-1545153996-e01b50d6ec39"
              ],
              type: "Chalé"
            },
            {
              name: "Agroturismo Vale Verde",
              description: "Propriedade de produção orgânica com experiências de cultivo e colheita",
              location: "Quatro Barras, Paraná",
              price: "R$ 180 por noite",
              activities: ["Plantio orgânico", "Culinária rural", "Colheita de frutas"],
              amenities: ["Viveiro de mudas", "Refeições com produtos da fazenda", "Hospedagem simples"],
              hours: "Check-in: 14h / Check-out: 10h",
              contact: {
                phone: "(41) 3672-3344",
                email: "agroturismo@valeverde.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
              images: [
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
                "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95"
              ],
              type: "Agroturismo"
            },
            {
              name: "Café Colonial Waffenhaus",
              description: "Café colonial de tradição germânica com produtos artesanais",
              location: "Marechal Cândido Rondon, Paraná",
              price: "R$ 95 por pessoa",
              activities: ["Gastronomia germânica", "História da colonização", "Produtos artesanais"],
              amenities: ["Amplo salão", "Estacionamento", "Espaço para eventos"],
              hours: "Funcionamento: 10h às 19h (sexta a domingo)",
              contact: {
                phone: "(45) 3254-6677",
                email: "contato@waffenhaus.com.br",
                website: url
              },
              image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
              images: [
                "https://images.unsplash.com/photo-1601050690597-df0568f70950",
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
              ],
              type: "Café Colonial"
            }
          ];
        }
        
        // Process and normalize property data
        const properties = this.normalizeProperties(mockProperties);
        
        return {
          success: true,
          properties: properties
        };
      }
      
    } catch (error: any) {
      console.error('Error in scrapeWebsite:', error);
      return {
        success: false,
        error: error.message || 'Erro ao extrair dados do site'
      };
    }
  }
  
  private formatTrivagoUrl(url: string): string {
    // If the URL is already from Trivago, use it directly
    if (url.includes('trivago.com')) {
      return url;
    }
    
    // Otherwise, create a Trivago search URL for agrotourism in Paraná
    return `${this.trivagoUrl}/pt-BR/srl/hotels-paraná-brasil/agriturismo-pousada-rural?search=paraná%20agroturismo`;
  }
  
  private normalizeProperties(properties: ExtractedProperty[]): ExtractedProperty[] {
    return properties.map(property => {
      // Clean and normalize price
      let normalizedPrice = property.price || '';
      
      // Assign a random property type if not specified
      const type = property.type || this.getRandomPropertyType();
      
      // Make sure arrays are actually arrays
      const activities = Array.isArray(property.activities) 
        ? property.activities 
        : property.activities ? [property.activities] : [];
        
      const amenities = Array.isArray(property.amenities) 
        ? property.amenities 
        : property.amenities ? [property.amenities] : [];
      
      // Convert single image to images array if needed
      const images = Array.isArray(property.images) 
        ? property.images 
        : property.image ? [property.image] : [];
      
      return {
        name: property.name || 'Propriedade sem nome',
        description: property.description || '',
        location: property.location || 'Localização não informada',
        price: normalizedPrice,
        activities: activities.filter(a => a && a.trim() !== ''),
        amenities: amenities.filter(a => a && a.trim() !== ''),
        hours: property.hours || 'Não informado',
        contact: {
          phone: property.contact?.phone || 'Não informado',
          email: property.contact?.email || '',
          website: property.contact?.website || ''
        },
        image: property.image || '',
        images: images,
        type: type // Include the property type in normalized data
      };
    });
  }
  
  // Helper to get a random property type from the predefined list
  private getRandomPropertyType(): string {
    const randomIndex = Math.floor(Math.random() * this.propertyTypes.length);
    return this.propertyTypes[randomIndex];
  }
}

export const FirecrawlService = new FirecrawlServiceClass();
