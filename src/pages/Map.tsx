
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard, { Property } from '@/components/PropertyCard';
import ChatbotButton from '@/components/ChatbotButton';

// Sample properties data for the map
const mapProperties: Property[] = [
  {
    id: "1",
    name: "Fazenda Vale Verde",
    location: "Morretes, PR",
    price: 150,
    rating: 4.9,
    reviewCount: 128,
    image: "https://images.unsplash.com/photo-1566043641507-95a1226a03c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Café Colonial", "Cavalos", "Pousada"]
  },
  {
    id: "2",
    name: "Recanto das Araucárias",
    location: "Guarapuava, PR",
    price: 120,
    rating: 4.7,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1568052232259-254c1dde2b95?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Pesca", "Trilhas", "Refeições Caseiras"]
  },
  {
    id: "3",
    name: "Vinícola Santa Clara",
    location: "Bituruna, PR",
    price: 180,
    rating: 4.8,
    reviewCount: 102,
    image: "https://images.unsplash.com/photo-1562601579-599dec564e06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Degustação de Vinhos", "Tour Guiado", "Restaurante"]
  }
];

const Map = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Map Header */}
        <div className="bg-nature-50 py-10">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-nature-800 playfair">Mapa do Agroturismo</h1>
                <p className="mt-2 text-muted-foreground">
                  Explore as propriedades rurais do Paraná no mapa interativo
                </p>
              </div>
              
              <div className="mt-4 lg:mt-0 flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar no mapa..."
                    className="pl-9 pr-4 py-2 bg-white border border-nature-200 rounded-lg text-sm w-[220px] focus:outline-none focus:ring-1 focus:ring-nature-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  Filtros
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map and Properties */}
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Properties List */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <h2 className="font-semibold text-lg mb-4">Propriedades Próximas</h2>
                <div className="space-y-4">
                  {mapProperties.map(property => (
                    <div 
                      key={property.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedProperty?.id === property.id 
                          ? 'bg-nature-50 border border-nature-200' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedProperty(property)}
                    >
                      <div className="flex gap-3">
                        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={property.image} 
                            alt={property.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{property.name}</h3>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{property.location}</span>
                          </div>
                          <div className="mt-1 text-sm">
                            <span className="font-medium">R$ {property.price}</span>
                            <span className="text-xs text-muted-foreground ml-1">/ por pessoa</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-nature-50 rounded-lg overflow-hidden border border-nature-200 h-[500px] relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <Info className="h-10 w-10 text-nature-600 mb-4" />
                  <h3 className="text-lg font-medium text-nature-800 mb-2">Mapa Interativo</h3>
                  <p className="text-muted-foreground max-w-md">
                    Esta é uma visualização de demonstração. Em um ambiente de produção, 
                    aqui seria integrado um mapa interativo real usando Google Maps, 
                    Mapbox ou outra API de mapas.
                  </p>
                  
                  {/* Simulated Map Markers */}
                  <div className="absolute left-1/4 top-1/3">
                    <div className="relative">
                      <MapPin className="h-8 w-8 text-nature-600 fill-nature-100" />
                    </div>
                  </div>
                  <div className="absolute right-1/3 top-1/2">
                    <div className="relative">
                      <MapPin className="h-8 w-8 text-nature-600 fill-nature-100" />
                    </div>
                  </div>
                  <div className="absolute left-1/2 bottom-1/4">
                    <div className="relative">
                      <MapPin className="h-8 w-8 text-nature-600 fill-nature-100" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Property Details */}
              {selectedProperty && (
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">{selectedProperty.name}</h2>
                    <div className="bg-nature-50 text-nature-700 text-xs font-medium px-2 py-1 rounded-full">
                      {selectedProperty.tags[0]}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{selectedProperty.location}</span>
                  </div>
                  
                  <div className="flex gap-4 mb-6">
                    <Button>Ver Detalhes</Button>
                    <Button variant="outline">Contato</Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="font-medium">Avaliação</div>
                      <div className="mt-1">{selectedProperty.rating} / 5</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="font-medium">Preço</div>
                      <div className="mt-1">R$ {selectedProperty.price}</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <div className="font-medium">Recursos</div>
                      <div className="mt-1">{selectedProperty.tags.length}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Map;
