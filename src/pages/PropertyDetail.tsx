
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Calendar, Clock, Users, ChevronLeft, ChevronRight, Heart, Share, Bookmark, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Property } from '@/components/PropertyCard';
import ExperienceCard, { Experience } from '@/components/ExperienceCard';
import ChatbotButton from '@/components/ChatbotButton';

// Dados simulados para a propriedade
const property: Property = {
  id: "1",
  name: "Fazenda Vale Verde",
  location: "Morretes, PR",
  price: 120,
  rating: 4.8,
  reviewCount: 98,
  image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  tags: ["Café Colonial", "Trilhas", "Pousada"]
};

// Mais fotos da propriedade
const propertyImages = [
  "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  "https://images.unsplash.com/photo-1464288550599-93503f8eda8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80",
  "https://images.unsplash.com/photo-1623617547623-86d2a47e44d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  "https://images.unsplash.com/photo-1619546592429-d4848c55b37c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  "https://images.unsplash.com/photo-1495107334309-fcf20f6a8343?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
];

// Dados simulados para experiências disponíveis na propriedade
const experiences: Experience[] = [
  {
    id: "101",
    title: "Colheita de Frutas Orgânicas",
    description: "Colha suas próprias frutas orgânicas e aprenda sobre agricultura sustentável.",
    image: "https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    duration: "2 horas",
    price: 60,
    rating: 4.7,
    reviewCount: 45,
    category: "Familiar"
  },
  {
    id: "102",
    title: "Degustação de Cachaças Artesanais",
    description: "Prove diferentes cachaças produzidas localmente, com explicações sobre o processo de fabricação.",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    duration: "1.5 horas",
    price: 80,
    rating: 4.9,
    reviewCount: 32,
    category: "Gastronomia"
  },
  {
    id: "103",
    title: "Trilha na Mata Atlântica",
    description: "Explore a rica biodiversidade da Mata Atlântica com um guia experiente.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    duration: "3 horas",
    price: 50,
    rating: 4.8,
    reviewCount: 67,
    category: "Aventura"
  }
];

// Dados simulados para avaliações
const reviews = [
  {
    id: 1,
    name: "Ana Silva",
    date: "Setembro 2023",
    rating: 5,
    comment: "Uma experiência incrível! A fazenda é linda, bem cuidada e a equipe é muito atenciosa. O café colonial é delicioso e as trilhas têm vistas deslumbrantes. Já estamos planejando voltar!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80"
  },
  {
    id: 2,
    name: "Carlos Oliveira",
    date: "Agosto 2023",
    rating: 4,
    comment: "Gostei muito da minha visita. A fazenda é bem organizada e as atividades são divertidas. A comida é excelente, mas achei que algumas trilhas poderiam ter mais sinalização.",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80"
  },
  {
    id: 3,
    name: "Maria Costa",
    date: "Julho 2023",
    rating: 5,
    comment: "Simplesmente maravilhoso! Passamos um fim de semana na pousada e foi perfeito. Café da manhã delicioso, trilhas bem marcadas e a vista é espetacular. Voltaremos com certeza!",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1288&q=80"
  }
];

// Detalhes da propriedade
const propertyDetails = {
  description: "A Fazenda Vale Verde está localizada na encosta da Serra do Mar, próxima a Morretes, no Paraná. Com mais de 100 hectares de área preservada, oferece uma experiência autêntica de contato com a natureza e a cultura rural paranaense.\n\nDispomos de trilhas ecológicas, cachoeiras naturais, pousada confortável e um reconhecido café colonial com produtos feitos na própria fazenda. Nossas atividades são voltadas para toda a família, proporcionando momentos de lazer, aprendizado e conexão com a terra.",
  amenities: [
    "Café colonial completo",
    "Trilhas ecológicas",
    "Cachoeiras naturais",
    "Pousada com 15 quartos",
    "Área para piquenique",
    "Loja de produtos locais",
    "Wi-Fi nas áreas comuns",
    "Estacionamento gratuito"
  ],
  activities: [
    "Colheita de frutas orgânicas",
    "Passeio a cavalo",
    "Observação de pássaros",
    "Degustação de cachaça artesanal",
    "Trilhas guiadas na Mata Atlântica",
    "Workshop de culinária rural",
    "Pescaria em lago natural"
  ],
  hours: {
    monday: "08:00 - 17:00",
    tuesday: "08:00 - 17:00",
    wednesday: "08:00 - 17:00",
    thursday: "08:00 - 17:00",
    friday: "08:00 - 17:00",
    saturday: "08:00 - 18:00",
    sunday: "08:00 - 18:00"
  },
  contactInfo: {
    phone: "(41) 99999-9999",
    email: "contato@fazendavaleverde.com.br",
    website: "www.fazendavaleverde.com.br",
    address: "Estrada da Serra, km 15 - Morretes, PR"
  }
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Função para navegar entre as imagens
  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === propertyImages.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? propertyImages.length - 1 : prev - 1
    );
  };
  
  // Toggle de favorito
  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="bg-nature-50 py-3">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Link to="/" className="hover:text-nature-700">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/properties" className="hover:text-nature-700">Propriedades</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{property.name}</span>
            </div>
          </div>
        </div>
      
        {/* Property Gallery */}
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-6">
            <img 
              src={propertyImages[currentImageIndex]} 
              alt={`${property.name} - Imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
              aria-label="Próxima imagem"
            >
              <ChevronRight size={24} />
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
              {propertyImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentImageIndex === index ? "bg-white w-3" : "bg-white/60"
                  )}
                  aria-label={`Ver imagem ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
            {propertyImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={cn(
                  "flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition",
                  currentImageIndex === index ? "border-nature-600" : "border-transparent"
                )}
              >
                <img 
                  src={image} 
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          
          {/* Property Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold playfair">{property.name}</h1>
                  <div className="flex items-center mt-2 text-sm">
                    <MapPin size={16} className="text-nature-600 mr-1" />
                    <span>{property.location}</span>
                    <div className="flex items-center ml-4">
                      <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                      <span>{property.rating}</span>
                      <span className="text-muted-foreground ml-1">({property.reviewCount} avaliações)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Heart className={cn(
                      "h-5 w-5",
                      isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                    )} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Compartilhar"
                  >
                    <Share className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              
              {/* Tabs */}
              <Tabs defaultValue="about" className="mt-6">
                <TabsList className="mb-6">
                  <TabsTrigger value="about">Sobre</TabsTrigger>
                  <TabsTrigger value="experiences">Experiências</TabsTrigger>
                  <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-muted-foreground">
                      {propertyDetails.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Comodidades</h2>
                      <ul className="space-y-2">
                        {propertyDetails.amenities.map((amenity, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-nature-600 mr-2" />
                            {amenity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Atividades</h2>
                      <ul className="space-y-2">
                        {propertyDetails.activities.map((activity, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-nature-600 mr-2" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Horário de Funcionamento</h2>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Segunda-feira</span>
                          <span>{propertyDetails.hours.monday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Terça-feira</span>
                          <span>{propertyDetails.hours.tuesday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quarta-feira</span>
                          <span>{propertyDetails.hours.wednesday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quinta-feira</span>
                          <span>{propertyDetails.hours.thursday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sexta-feira</span>
                          <span>{propertyDetails.hours.friday}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Sábado</span>
                          <span>{propertyDetails.hours.saturday}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Domingo</span>
                          <span>{propertyDetails.hours.sunday}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Contato</h2>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Phone size={16} className="mr-2 text-nature-600" />
                          <span>{propertyDetails.contactInfo.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail size={16} className="mr-2 text-nature-600" />
                          <span>{propertyDetails.contactInfo.email}</span>
                        </div>
                        <div className="flex items-start mt-3">
                          <MapPin size={16} className="mr-2 text-nature-600 mt-0.5" />
                          <span>{propertyDetails.contactInfo.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="experiences">
                  <h2 className="text-xl font-semibold mb-6">Experiências Disponíveis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {experiences.map(experience => (
                      <ExperienceCard 
                        key={experience.id} 
                        experience={experience} 
                        horizontal
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Avaliações dos Visitantes</h2>
                    <div className="flex items-center text-lg">
                      <Star size={20} className="text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">{property.rating}</span>
                      <span className="text-muted-foreground ml-1 text-sm">({property.reviewCount} avaliações)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b border-border pb-6">
                        <div className="flex items-start">
                          <img 
                            src={review.avatar} 
                            alt={review.name}
                            className="w-10 h-10 rounded-full object-cover mr-4"
                          />
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{review.name}</h3>
                              <span className="text-muted-foreground text-sm ml-2">{review.date}</span>
                            </div>
                            <div className="flex mt-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  size={14}
                                  className={cn(
                                    i < review.rating 
                                      ? "fill-yellow-400 text-yellow-400" 
                                      : "text-muted-foreground"
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground text-sm">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Button variant="outline">Ver Todas as Avaliações</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Booking Sidebar */}
            <div className="mt-6 lg:mt-0">
              <div className="bg-white border border-border rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Reserve sua Visita</h2>
                
                <div className="mb-4">
                  <div className="flex items-baseline mb-2">
                    <span className="text-2xl font-bold">R$ {property.price}</span>
                    <span className="text-muted-foreground ml-1">/ por pessoa</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{property.rating}</span>
                    <span className="text-muted-foreground ml-1">({property.reviewCount} avaliações)</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center px-4 py-3 border-b border-border">
                      <Calendar size={18} className="text-nature-600 mr-2" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Data</p>
                        <p className="font-medium">Escolha uma data</p>
                      </div>
                    </div>
                    <div className="flex items-center px-4 py-3 border-b border-border">
                      <Clock size={18} className="text-nature-600 mr-2" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Horário</p>
                        <p className="font-medium">Escolha um horário</p>
                      </div>
                    </div>
                    <div className="flex items-center px-4 py-3">
                      <Users size={18} className="text-nature-600 mr-2" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Visitantes</p>
                        <p className="font-medium">2 adultos</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mb-3">Agendar Visita</Button>
                <Button variant="outline" className="w-full">
                  <Bookmark size={16} className="mr-2" />
                  Salvar para depois
                </Button>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    Recomendamos que agende sua visita com antecedência para garantir disponibilidade.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" size="sm">
                      <Phone size={14} className="mr-1" />
                      Ligar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail size={14} className="mr-1" />
                      E-mail
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default PropertyDetail;
