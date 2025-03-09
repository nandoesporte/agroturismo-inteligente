
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import PropertyCard, { Property } from './PropertyCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const FeaturedProperties = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, []);
  
  useEffect(() => {
    fetchFeaturedProperties();
  }, []);
  
  const fetchFeaturedProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      
      // Transform the data to match the Property interface
      const transformedProperties = data.map(item => ({
        id: item.id,
        name: item.name,
        location: item.location,
        price: item.price,
        rating: item.rating || 0,
        reviewCount: item.review_count || 0,
        image: item.image || 'https://images.unsplash.com/photo-1566043641507-95a1226a03c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        tags: item.tags || [],
        isFeatured: item.is_featured
      }));
      
      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    } finally {
      setLoading(false);
    }
  };
  
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
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div 
                key={index} 
                className="bg-gray-100 rounded-lg h-80 animate-pulse"
              />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma propriedade em destaque encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
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
        )}
        
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
