
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard, { Property } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter, Map, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatbotButton from '@/components/ChatbotButton';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Categorias de filtro
const categories = [
  "Gastronomia", "Aventura", "Hospedagem", "Cultural", "Bem-estar", "Familiar"
];

// Tipos de atividades
const activities = [
  "Trilhas", "Degustação", "Colheita", "Pesca", "Cavalgada", "Produtos Artesanais", 
  "Camping", "Observação de Aves", "Cachoeiras", "Tirolesa"
];

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]); // Increased max price range
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchProperties();
  }, []);
  
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*');
      
      if (error) throw error;
      
      // Transform the data to match the Property interface
      const transformedProperties: Property[] = data.map(item => ({
        id: item.id,
        name: item.name,
        location: item.location,
        price: typeof item.price === 'number' ? item.price : 0,
        rating: item.rating || 0,
        reviewCount: item.review_count || 0,
        image: item.image || 'https://images.unsplash.com/photo-1566043641507-95a1226a03c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        images: item.images || [],
        tags: item.tags || [],
        isFeatured: item.is_featured || false,
        amenities: item.amenities || [],
        hours: item.hours || '',
        contact: (item.contact as Property['contact']) || {}
      }));
      
      console.log('Fetched properties:', transformedProperties.length);
      setProperties(transformedProperties);
      setFilteredProperties(transformedProperties);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Erro ao carregar propriedades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar propriedades com base nos critérios selecionados
  useEffect(() => {
    let results = properties;
    
    // Filtrar por termo de busca
    if (searchTerm) {
      results = results.filter(
        property => 
          property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (property.tags && property.tags.some(tag => 
            tag && typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      );
    }
    
    // Filtrar por faixa de preço
    results = results.filter(
      property => property.price >= priceRange[0] && property.price <= priceRange[1]
    );
    
    // Filtrar por categorias selecionadas
    if (selectedCategories.length > 0) {
      results = results.filter(property => {
        // Verifica se alguma tag da propriedade corresponde a alguma categoria selecionada
        return property.tags && property.tags.some(tag => 
          selectedCategories.some(category => 
            tag && typeof tag === 'string' && tag.toLowerCase().includes(category.toLowerCase())
          )
        );
      });
    }
    
    // Filtrar por atividades
    if (selectedActivities.length > 0) {
      results = results.filter(property => 
        property.tags && property.tags.some(tag => 
          selectedActivities.some(activity => 
            tag && typeof tag === 'string' && tag.toLowerCase().includes(activity.toLowerCase())
          )
        )
      );
    }
    
    console.log('Filtered properties:', results.length);
    setFilteredProperties(results);
  }, [searchTerm, properties, priceRange, selectedCategories, selectedActivities]);
  
  // Toggle para uma categoria
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Toggle para uma atividade
  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };
  
  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setSelectedActivities([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header with dark agrotourism background */}
        <div 
          className="relative py-12 md:py-16 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80')"
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="container max-w-7xl mx-auto px-4 relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold playfair mb-4 text-white">Propriedades Rurais</h1>
            <p className="text-gray-200 max-w-2xl">
              Descubra as melhores propriedades rurais do Paraná para sua próxima aventura. 
              Filtre por tipo de experiência, localização e muito mais.
            </p>
          </div>
        </div>
        
        {/* Filters and Properties */}
        <div className="container max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Pesquisar por nome, localização ou atividade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10"
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpar pesquisa"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="md:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <>
                  <X size={16} className="mr-2" />
                  Fechar Filtros
                </>
              ) : (
                <>
                  <Filter size={16} className="mr-2" />
                  Filtros
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="md:w-auto"
            >
              <Map size={16} className="mr-2" />
              Ver no Mapa
            </Button>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white border border-border rounded-lg p-6 mb-8 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <SlidersHorizontal size={18} className="mr-2" />
                  Filtros
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                >
                  Limpar Tudo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Faixa de Preço</h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={500}
                      step={10}
                      onValueChange={setPriceRange}
                      className="my-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>R$ {priceRange[0]}</span>
                      <span>R$ {priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Categorias</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Activities */}
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium mb-3">Atividades</h3>
                  <div className="flex flex-wrap gap-2">
                    {activities.map(activity => (
                      <div
                        key={activity}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs cursor-pointer border transition",
                          selectedActivities.includes(activity)
                            ? "bg-nature-100 border-nature-200 text-nature-800"
                            : "bg-white border-border hover:bg-muted"
                        )}
                        onClick={() => toggleActivity(activity)}
                      >
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'propriedade encontrada' : 'propriedades encontradas'}
            </p>
          </div>
          
          {/* Properties Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-nature-600" />
              <p className="text-muted-foreground">Carregando propriedades...</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">Nenhuma propriedade encontrada com os filtros atuais.</p>
              <Button onClick={clearFilters}>Limpar Filtros</Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default Properties;
