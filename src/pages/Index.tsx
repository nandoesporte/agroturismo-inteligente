
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import FeaturedProperties from '@/components/FeaturedProperties';
import Footer from '@/components/Footer';
import ChatbotButton from '@/components/ChatbotButton';
import { ChevronRight, Star, MapPin, Utensils, Leaf, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ExperienceCard, { Experience } from '@/components/ExperienceCard';

// Sample experiences data
const experiences: Experience[] = [
  {
    id: "1",
    title: "Colheita de Uvas na Vinícola Santa Clara",
    description: "Participe da colheita de uvas e aprenda sobre o processo de fabricação de vinhos premiados.",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
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
    image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
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
  }
];

const categories = [
  { 
    name: "Fazendas Históricas", 
    icon: <MapPin className="h-5 w-5" />,
    count: 12,
    image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
  },
  { 
    name: "Experiências Gastronômicas", 
    icon: <Utensils className="h-5 w-5" />,
    count: 28,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  { 
    name: "Ecoturismo e Trilhas", 
    icon: <Leaf className="h-5 w-5" />,
    count: 18,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
  },
  { 
    name: "Cafeterias Rurais", 
    icon: <Coffee className="h-5 w-5" />,
    count: 15,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1456&q=80"
  }
];

const testimonials = [
  {
    id: 1,
    text: "Uma experiência incrível! Conhecer as propriedades rurais do Paraná e vivenciar o dia a dia no campo foi uma das melhores decisões que tomamos nas férias.",
    author: "Maria Silva",
    location: "São Paulo, SP",
    rating: 5,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1361&q=80"
  },
  {
    id: 2,
    text: "O app facilitou muito a nossa viagem. Conseguimos encontrar lugares incríveis que não estão nos roteiros convencionais e fazer reservas de forma super prática.",
    author: "Carlos Mendes",
    location: "Curitiba, PR",
    rating: 5,
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80"
  },
  {
    id: 3,
    text: "As recomendações personalizadas fizeram toda a diferença. Cada propriedade que visitamos estava perfeitamente alinhada com nossos interesses.",
    author: "Ana Oliveira",
    location: "Rio de Janeiro, RJ",
    rating: 4,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80"
  }
];

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero */}
      <Hero />
      
      {/* Featured Properties */}
      <FeaturedProperties />
      
      {/* Categories */}
      <section className="section-spacing container-px bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title playfair">Descubra por Categorias</h2>
            <p className="section-subtitle">
              Explore o agroturismo do Paraná através das nossas categorias especiais
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link 
                key={index}
                to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group relative rounded-xl overflow-hidden aspect-square hover-scale"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover trans group-hover:scale-105"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                      <p className="text-white/80 text-sm">{category.count} opções</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {category.icon}
                    </div>
                  </div>
                  <div className="mt-4 w-full h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorar <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 md:py-24 container-px">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Paisagem do Paraná"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
            </div>
            
            <div className="relative py-16 px-6 md:py-24 md:px-12 lg:px-16">
              <div className="max-w-lg">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 playfair">
                  Crie Memórias Inesquecíveis no Paraná Rural
                </h2>
                <p className="text-white/90 text-lg mb-8">
                  Planeje sua próxima aventura nas propriedades rurais mais acolhedoras do estado. Experiências autênticas esperam por você.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-nature-800 hover:bg-white/90">
                    Comece sua Jornada
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Fale Conosco
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Experiences */}
      <section className="section-spacing container-px">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold playfair">Experiências Imperdíveis</h2>
              <p className="text-muted-foreground mt-2">
                Atividades que transformam sua visita em uma experiência inesquecível
              </p>
            </div>
            <Link 
              to="/experiences"
              className="hidden md:flex items-center text-nature-700 hover:text-nature-800 trans text-sm font-medium"
            >
              Ver todas
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button 
              variant="outline" 
              className="border-nature-200 hover:border-nature-300 hover:bg-nature-50"
            >
              Ver Todas as Experiências
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="section-spacing container-px bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title playfair">O que Dizem Nossos Visitantes</h2>
            <p className="section-subtitle">
              Experiências reais de pessoas que exploraram o agroturismo no Paraná
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-white rounded-xl p-6 shadow-sm hover-lift"
              >
                <div className="flex space-x-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < testimonial.rating 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                
                <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>
                
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className="font-medium text-sm">{testimonial.author}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-12 md:py-16 container-px">
        <div className="max-w-4xl mx-auto bg-nature-50 rounded-xl p-8 md:p-12">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold playfair mb-4 text-nature-800">
              Receba Novidades e Promoções
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Inscreva-se para receber as últimas notícias sobre o agroturismo no Paraná, 
              novas propriedades e ofertas exclusivas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="flex-1 px-4 py-3 bg-white border border-nature-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-nature-500"
              />
              <Button className="bg-nature-600 hover:bg-nature-700">
                Inscrever-se
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Ao inscrever-se, você concorda com nossa Política de Privacidade.
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
      
      {/* Chatbot Button */}
      <ChatbotButton />
    </div>
  );
};

export default Index;
