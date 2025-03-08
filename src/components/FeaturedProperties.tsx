
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import PropertyCard, { Property } from './PropertyCard';
import { Button } from '@/components/ui/button';

// Sample data for properties
const sampleProperties: Property[] = [
  {
    id: "1",
    name: "Fazenda Vale Verde",
    location: "Morretes, PR",
    price: 150,
    rating: 4.9,
    reviewCount: 128,
    image: "https://images.unsplash.com/photo-1566043641507-95a1226a03c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Café Colonial", "Cavalos", "Pousada"],
    isFeatured: true
  },
  {
    id: "2",
    name: "Recanto das Araucárias",
    location: "Guarapuava, PR",
    price: 120,
    rating: 4.7,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1568052232259-254c1dde2b95?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Pesca", "Trilhas", "Refeições Caseiras"],
    isFeatured: true
  },
  {
    id: "3",
    name: "Vinícola Santa Clara",
    location: "Bituruna, PR",
    price: 180,
    rating: 4.8,
    reviewCount: 102,
    image: "https://images.unsplash.com/photo-1562601579-599dec564e06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Degustação de Vinhos", "Tour Guiado", "Restaurante"],
    isFeatured: true
  },
  {
    id: "4",
    name: "Sítio Água Cristalina",
    location: "Prudentópolis, PR",
    price: 90,
    rating: 4.6,
    reviewCount: 74,
    image: "https://images.unsplash.com/photo-1619546952812-520e98064a52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    tags: ["Cachoeiras", "Camping", "Café da Manhã"],
    isFeatured: false
  },
  {
    id: "5",
    name: "Fazenda do Café",
    location: "Londrina, PR",
    price: 135,
    rating: 4.7,
    reviewCount: 95,
    image: "https://images.unsplash.com/photo-1537182534312-f945134cce34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    tags: ["Plantação de Café", "Degustação", "Tour Educativo"],
    isFeatured: false
  },
  {
    id: "6",
    name: "Paraíso dos Pássaros",
    location: "Foz do Iguaçu, PR",
    price: 200,
    rating: 4.9,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1523537444585-432d3eb564a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Observação de Aves", "Chalés", "Piscina Natural"],
    isFeatured: false
  }
];

const FeaturedProperties = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // For a real app, you'd fetch this data from an API
  const properties = sampleProperties;
  
  return (
    <section className="section-spacing container-px">
      <div className={cn(
        "transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold playfair">Propriedades em Destaque</h2>
            <p className="text-muted-foreground mt-2">
              Conheça os destinos mais amados de agroturismo no Paraná
            </p>
          </div>
          <div className="hidden md:flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Próximo"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.slice(0, 3).map((property, index) => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              featured
              className={cn(
                "opacity-0",
                isVisible && "animate-fade-up",
                isVisible && index === 0 && "animation-delay-0",
                isVisible && index === 1 && "animation-delay-100",
                isVisible && index === 2 && "animation-delay-200"
              )}
            />
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            className="border-nature-200 hover:border-nature-300 hover:bg-nature-50"
          >
            Ver Todas as Propriedades
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
