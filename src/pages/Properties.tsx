
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

// Dados simulados para propriedades
const propertiesData: Property[] = [
  {
    id: "1",
    name: "Fazenda Vale Verde",
    location: "Morretes, PR",
    price: 120,
    rating: 4.8,
    reviewCount: 98,
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Café Colonial", "Trilhas", "Pousada"]
  },
  {
    id: "2",
    name: "Vinícola Santa Clara",
    location: "Bituruna, PR",
    price: 150,
    rating: 4.9,
    reviewCount: 124,
    image: "https://images.unsplash.com/photo-1559519529-0936e4058364?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80",
    tags: ["Vinhos", "Degustação", "Colheita"]
  },
  {
    id: "3",
    name: "Recanto das Araucárias",
    location: "Guarapuava, PR",
    price: 135,
    rating: 4.7,
    reviewCount: 87,
    image: "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Pinhão", "Cavalos", "Camping"]
  },
  {
    id: "4",
    name: "Sítio Água Cristalina",
    location: "Tibagi, PR",
    price: 100,
    rating: 4.6,
    reviewCount: 56,
    image: "https://images.unsplash.com/photo-1593602828332-a6d8e3f7c386?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Cachoeira", "Frutas", "Tirolesa"]
  },
  {
    id: "5",
    name: "Fazenda Arapongas",
    location: "Castro, PR",
    price: 180,
    rating: 4.9,
    reviewCount: 112,
    image: "https://images.unsplash.com/photo-1571989569744-4c678117f85e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1467&q=80",
    tags: ["Produtos Artesanais", "Ordenha", "Queijos"]
  },
  {
    id: "6",
    name: "Estância Pé da Serra",
    location: "Antonina, PR",
    price: 145,
    rating: 4.7,
    reviewCount: 75,
    image: "https://images.unsplash.com/photo-1596412545575-11146b7d9374?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    tags: ["Mata Atlântica", "Café da Manhã", "Pescaria"]
  }
];

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
  const [properties, setProperties] = useState<Property[]>(propertiesData);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(propertiesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  
  // Filtrar propriedades com base nos critérios selecionados
  useEffect(() => {
    let results = properties;
    
    // Filtrar por termo de busca
    if (searchTerm) {
      results = results.filter(
        property => 
          property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtrar por faixa de preço
    results = results.filter(
      property => property.price >= priceRange[0] && property.price <= priceRange[1]
    );
    
    // Filtrar por categorias selecionadas
    if (selectedCategories.length > 0) {
      // Simulação - na prática, as propriedades teriam um campo de categoria
      // Aqui estamos filtrando aleatoriamente apenas para demonstração
      results = results.filter(property => {
        const randomMatch = Math.random() > 0.3;
        return randomMatch;
      });
    }
    
    // Filtrar por atividades
    if (selectedActivities.length > 0) {
      results = results.filter(property => 
        property.tags.some(tag => selectedActivities.includes(tag))
      );
    }
    
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
    setPriceRange([0, 200]);
    setSelectedCategories([]);
    setSelectedActivities([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <div className="bg-nature-50 py-12 md:py-16">
          <div className="container max-w-7xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold playfair mb-4">Propriedades Rurais</h1>
            <p className="text-muted-foreground max-w-2xl">
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
                      max={200}
                      step={5}
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
                    {categories.slice(0, 5).map(category => (
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
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
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
