
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ExperienceCard, { Experience } from '@/components/ExperienceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import ChatbotButton from '@/components/ChatbotButton';

// Dados simulados para experiências
const experiencesData: Experience[] = [
  {
    id: "1",
    title: "Colheita de Uvas na Vinícola Santa Clara",
    description: "Participe da colheita de uvas e aprenda sobre o processo de fabricação de vinhos premiados.",
    image: "https://images.unsplash.com/photo-1559156280-909f6bc8b0fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    duration: "3 horas",
    price: 120,
    rating: 4.9,
    reviewCount: 87,
    category: "Gastronomia"
  },
  {
    id: "2",
    title: "Cavalgada ao Pôr do Sol em Morretes",
    description: "Explore as trilhas rurais de Morretes a cavalo e desfrute de um incrível pôr do sol na Serra do Mar.",
    image: "https://images.unsplash.com/photo-1605987747468-3d9a8e2cde04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    duration: "2 horas",
    price: 150,
    rating: 4.8,
    reviewCount: 64,
    category: "Aventura"
  },
  {
    id: "3",
    title: "Café Colonial na Fazenda do Café",
    description: "Desfrute de um autêntico café colonial paranaense com produtos caseiros produzidos na fazenda.",
    image: "https://images.unsplash.com/photo-1510431198580-7727c9fa1e3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1548&q=80",
    duration: "2 horas",
    price: 85,
    rating: 4.7,
    reviewCount: 112,
    category: "Gastronomia"
  },
  {
    id: "4",
    title: "Workshop de Queijos Artesanais",
    description: "Aprenda a fazer queijos artesanais com produtores locais usando técnicas tradicionais.",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    duration: "4 horas",
    price: 160,
    rating: 4.9,
    reviewCount: 43,
    category: "Gastronomia"
  },
  {
    id: "5",
    title: "Trilha na Mata Atlântica",
    description: "Explore a exuberante Mata Atlântica com guias especializados e conheça a fauna e flora locais.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    duration: "3 horas",
    price: 95,
    rating: 4.6,
    reviewCount: 78,
    category: "Aventura"
  },
  {
    id: "6",
    title: "Passeio de Trator pela Fazenda",
    description: "Conheça toda a extensão da fazenda em um divertido passeio de trator com paradas estratégicas.",
    image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    duration: "1 hora",
    price: 60,
    rating: 4.5,
    reviewCount: 55,
    category: "Familiar"
  },
  {
    id: "7",
    title: "Degustação de Cachaças Artesanais",
    description: "Prove diferentes cachaças produzidas no Paraná, com explicações sobre o processo de fabricação.",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    duration: "1.5 horas",
    price: 110,
    rating: 4.8,
    reviewCount: 92,
    category: "Gastronomia"
  },
  {
    id: "8",
    title: "Observação de Aves na Serra do Mar",
    description: "Para amantes da natureza, uma experiência guiada para observar as mais diversas espécies de pássaros.",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1425&q=80",
    duration: "5 horas",
    price: 175,
    rating: 4.9,
    reviewCount: 37,
    category: "Aventura"
  }
];

// Categorias
const categories = ["Gastronomia", "Aventura", "Cultural", "Familiar", "Bem-estar"];

// Durações
const durations = ["Até 1 hora", "1-2 horas", "3-4 horas", "Mais de 4 horas"];

const Experiences = () => {
  const [experiences, setExperiences] = useState<Experience[]>(experiencesData);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>(experiencesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  
  // Filtrar experiências com base nos critérios selecionados
  useEffect(() => {
    let results = experiences;
    
    // Filtrar por termo de busca
    if (searchTerm) {
      results = results.filter(
        experience => 
          experience.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          experience.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          experience.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por categorias
    if (selectedCategories.length > 0) {
      results = results.filter(experience => 
        selectedCategories.includes(experience.category)
      );
    }
    
    // Filtrar por duração (simplificado para demonstração)
    if (selectedDurations.length > 0) {
      results = results.filter(experience => {
        const hours = parseInt(experience.duration.split(' ')[0]);
        
        if (selectedDurations.includes("Até 1 hora") && hours <= 1) return true;
        if (selectedDurations.includes("1-2 horas") && hours > 1 && hours <= 2) return true;
        if (selectedDurations.includes("3-4 horas") && hours >= 3 && hours <= 4) return true;
        if (selectedDurations.includes("Mais de 4 horas") && hours > 4) return true;
        
        return false;
      });
    }
    
    setFilteredExperiences(results);
  }, [searchTerm, experiences, selectedCategories, selectedDurations]);
  
  // Toggle para uma categoria
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Toggle para uma duração
  const toggleDuration = (duration: string) => {
    setSelectedDurations(prev => 
      prev.includes(duration) 
        ? prev.filter(d => d !== duration)
        : [...prev, duration]
    );
  };
  
  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedDurations([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <div className="bg-nature-50 py-12 md:py-16">
          <div className="container max-w-7xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold playfair mb-4">Experiências Rurais</h1>
            <p className="text-muted-foreground max-w-2xl">
              Descubra atividades únicas e autênticas para tornar sua visita ao campo inesquecível.
              Filtre por categoria, duração e muito mais.
            </p>
          </div>
        </div>
        
        {/* Filters and Experiences */}
        <div className="container max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Pesquisar experiências..."
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
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white border border-border rounded-lg p-6 mb-8 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Filter size={18} className="mr-2" />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Categorias</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <div
                        key={category}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm cursor-pointer border transition",
                          selectedCategories.includes(category)
                            ? "bg-nature-100 border-nature-200 text-nature-800"
                            : "bg-white border-border hover:bg-muted"
                        )}
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Duration */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Duração</h3>
                  <div className="space-y-2">
                    {durations.map(duration => (
                      <div key={duration} className="flex items-center">
                        <Checkbox
                          id={`duration-${duration}`}
                          checked={selectedDurations.includes(duration)}
                          onCheckedChange={() => toggleDuration(duration)}
                        />
                        <Label
                          htmlFor={`duration-${duration}`}
                          className="ml-2 text-sm cursor-pointer flex items-center"
                        >
                          <Clock size={14} className="mr-1" />
                          {duration}
                        </Label>
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
              {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experiência encontrada' : 'experiências encontradas'}
            </p>
          </div>
          
          {/* Experiences Grid */}
          {filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExperiences.map(experience => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">Nenhuma experiência encontrada com os filtros atuais.</p>
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

export default Experiences;
