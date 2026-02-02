import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Calendar, Clock, Users, ChevronLeft, ChevronRight, Heart, Share, Bookmark, Phone, Mail, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Property } from '@/components/PropertyCard';
import ExperienceCard, { Experience } from '@/components/ExperienceCard';
import ChatbotButton from '@/components/ChatbotButton';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReviewsList from '@/components/ReviewsList';
import ReviewForm from '@/components/ReviewForm';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([
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
  ]);
  const [dbReviews, setDbReviews] = useState([]);
  const [showAddReview, setShowAddReview] = useState(false);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
          
        if (propertyError) {
          throw propertyError;
        }
        
        if (!propertyData) {
          toast({
            title: "Propriedade não encontrada",
            description: "Não foi possível encontrar os detalhes desta propriedade.",
            variant: "destructive"
          });
          navigate('/properties');
          return;
        }
        
        const transformedProperty: Property = {
          id: propertyData.id,
          name: propertyData.name,
          location: propertyData.location,
          price: propertyData.price,
          rating: propertyData.rating || 0,
          reviewCount: propertyData.review_count || 0,
          image: propertyData.image || '',
          images: propertyData.images || [],
          tags: propertyData.tags || [],
          description: propertyData.description || '',
          amenities: propertyData.amenities || [],
          activities: propertyData.activities || [],
          hours: propertyData.hours || '',
          contact: propertyData.contact || {
            phone: 'Não informado',
            email: '',
            website: '',
            address: propertyData.location
          },
          isFeatured: propertyData.is_featured || false
        };
        
        setProperty(transformedProperty);
        
        const { data: experiencesData, error: experiencesError } = await supabase
          .from('experiences')
          .select('*')
          .limit(3);
          
        if (!experiencesError && experiencesData) {
          const transformedExperiences = experiencesData.map(exp => ({
            id: exp.id,
            title: exp.title,
            description: exp.description,
            image: exp.image || '',
            duration: exp.duration,
            price: exp.price,
            rating: exp.rating || 4.5,
            reviewCount: exp.review_count || 0,
            category: exp.category || 'Geral'
          }));
          
          setExperiences(transformedExperiences);
        }

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('property_id', id)
          .order('created_at', { ascending: false });

        if (!reviewsError && reviewsData) {
          setDbReviews(reviewsData);
        }
        
      } catch (error) {
        console.error('Error fetching property data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da propriedade.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPropertyData();
    }
  }, [id, navigate, toast]);
  
  const nextImage = () => {
    if (!property?.images?.length) return;
    
    setCurrentImageIndex(prev => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    if (!property?.images?.length) return;
    
    setCurrentImageIndex(prev => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };
  
  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
    
    toast({
      title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: isFavorite ? 
        "Esta propriedade foi removida dos seus favoritos." : 
        "Esta propriedade foi adicionada aos seus favoritos.",
    });
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const newReview = {
        ...reviewData,
        property_id: id
      };
      
      const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Avaliação enviada",
        description: "Sua avaliação foi enviada com sucesso. Obrigado por compartilhar sua experiência!",
      });
      
      const { data: updatedReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('property_id', id)
        .order('created_at', { ascending: false });
        
      if (!reviewsError && updatedReviews) {
        setDbReviews(updatedReviews);
      }
      
      setShowAddReview(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua avaliação. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-nature-600" />
            <p className="text-muted-foreground">Carregando detalhes da propriedade...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h2 className="text-2xl font-bold mb-2">Propriedade não encontrada</h2>
            <p className="text-muted-foreground mb-6">
              Não conseguimos encontrar a propriedade que você está procurando.
            </p>
            <Button onClick={() => navigate('/properties')}>
              Ver todas as propriedades
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const propertyImages = property.images && property.images.length > 0 
    ? property.images 
    : property.image 
      ? [property.image] 
      : ['https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5'];

  const formatPropertyHours = () => {
    if (typeof property.hours === 'string') {
      return {
        monday: property.hours,
        tuesday: property.hours,
        wednesday: property.hours,
        thursday: property.hours,
        friday: property.hours,
        saturday: property.hours,
        sunday: property.hours
      };
    }
    
    return {
      monday: "08:00 - 17:00",
      tuesday: "08:00 - 17:00",
      wednesday: "08:00 - 17:00",
      thursday: "08:00 - 17:00",
      friday: "08:00 - 17:00",
      saturday: "08:00 - 18:00",
      sunday: "08:00 - 18:00"
    };
  };

  const propertyHours = formatPropertyHours();

  const allReviews = [...(dbReviews || []), ...reviews];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
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
      
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-6">
            <img 
              src={propertyImages[currentImageIndex]} 
              alt={`${property.name} - Imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {propertyImages.length > 1 && (
              <>
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
              </>
            )}
            
            {propertyImages.length > 1 && (
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
            )}
          </div>
          
          {propertyImages.length > 1 && (
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
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              
              <Tabs defaultValue="about" className="mt-6">
                <TabsList className="mb-6">
                  <TabsTrigger value="about">Sobre</TabsTrigger>
                  <TabsTrigger value="experiences">Experiências</TabsTrigger>
                  <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-muted-foreground">
                      {property.description || 'Nenhuma descrição disponível para esta propriedade.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {property.amenities && property.amenities.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold mb-3">Comodidades</h2>
                        <ul className="space-y-2">
                          {property.amenities.map((amenity, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-nature-600 mr-2" />
                              {amenity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {property.activities && property.activities.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold mb-3">Atividades</h2>
                        <ul className="space-y-2">
                          {property.activities.map((activity, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-nature-600 mr-2" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Horário de Funcionamento</h2>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Segunda-feira</span>
                          <span>{propertyHours.monday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Terça-feira</span>
                          <span>{propertyHours.tuesday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quarta-feira</span>
                          <span>{propertyHours.wednesday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quinta-feira</span>
                          <span>{propertyHours.thursday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sexta-feira</span>
                          <span>{propertyHours.friday}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Sábado</span>
                          <span>{propertyHours.saturday}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Domingo</span>
                          <span>{propertyHours.sunday}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Contato</h2>
                      <div className="space-y-2 text-sm">
                        {property.contact?.phone && (
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2 text-nature-600" />
                            <span>{property.contact.phone}</span>
                          </div>
                        )}
                        
                        {property.contact?.email && (
                          <div className="flex items-center">
                            <Mail size={16} className="mr-2 text-nature-600" />
                            <span>{property.contact.email}</span>
                          </div>
                        )}
                        
                        <div className="flex items-start mt-3">
                          <MapPin size={16} className="mr-2 text-nature-600 mt-0.5" />
                          <span>{property.contact?.address || property.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="experiences">
                  <h2 className="text-xl font-semibold mb-6">Experiências Disponíveis</h2>
                  {experiences.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {experiences.map(experience => (
                        <ExperienceCard 
                          key={experience.id} 
                          experience={experience} 
                          horizontal
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhuma experiência disponível para esta propriedade no momento.
                    </p>
                  )}
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
                  
                  <div className="mb-6">
                    {showAddReview ? (
                      <div className="border border-border rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-medium mb-4">Adicionar Avaliação</h3>
                        <ReviewForm 
                          propertyId={id}
                          onReviewSubmitted={() => {
                            const fetchReviews = async () => {
                              const { data, error } = await supabase
                                .from('reviews')
                                .select('*')
                                .eq('property_id', id)
                                .order('created_at', { ascending: false });
                              
                              if (!error && data) {
                                setDbReviews(data);
                              }
                            };
                            
                            fetchReviews();
                          }}
                        />
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddReview(false)}
                            className="mr-2"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setShowAddReview(true)}
                        className="bg-nature-600 hover:bg-nature-700"
                      >
                        Avaliar esta propriedade
                      </Button>
                    )}
                  </div>
                  
                  {allReviews.length > 0 ? (
                    <div className="space-y-6">
                      {allReviews.map((review, index) => (
                        <div key={review.id || index} className="border-b border-border pb-6">
                          <div className="flex items-start">
                            <img 
                              src={review.user_avatar || review.avatar || 'https://via.placeholder.com/40'} 
                              alt={review.user_name || review.name}
                              className="w-10 h-10 rounded-full object-cover mr-4"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/40';
                              }}
                            />
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-medium">{review.user_name || review.name}</h3>
                                <span className="text-muted-foreground text-sm ml-2">
                                  {review.created_at 
                                    ? new Date(review.created_at).toLocaleDateString('pt-BR', { 
                                        year: 'numeric', 
                                        month: 'long'
                                      }) 
                                    : review.date
                                  }
                                </span>
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
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhuma avaliação disponível para esta propriedade.
                    </p>
                  )}
                  
                  {allReviews.length > 0 && (
                    <div className="mt-8 text-center">
                      <Button variant="outline">Ver Todas as Avaliações</Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
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
                    {property.contact?.phone && (
                      <Button variant="outline" size="sm" onClick={() => window.location.href = `tel:${property.contact.phone}`}>
                        <Phone size={14} className="mr-1" />
                        Ligar
                      </Button>
                    )}
                    {property.contact?.email && (
                      <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${property.contact.email}`}>
                        <Mail size={14} className="mr-1" />
                        E-mail
                      </Button>
                    )}
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
