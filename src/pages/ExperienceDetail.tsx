
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Calendar, Clock, ChevronLeft, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Experience } from '@/components/ExperienceCard';
import ReviewsList from '@/components/ReviewsList';
import ChatbotButton from '@/components/ChatbotButton';
import { useToast } from '@/hooks/use-toast';

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchExperienceData = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('experiences')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          toast({
            title: "Experiência não encontrada",
            description: "Não foi possível encontrar os detalhes desta experiência.",
            variant: "destructive"
          });
          navigate('/experiences');
          return;
        }
        
        const transformedExperience: Experience = {
          id: data.id,
          title: data.title,
          description: data.description,
          image: data.image || '',
          duration: data.duration,
          price: data.price,
          rating: data.rating || 0,
          reviewCount: data.review_count || 0,
          category: data.category || 'Geral'
        };
        
        setExperience(transformedExperience);
      } catch (error: any) {
        console.error('Error fetching experience data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da experiência.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchExperienceData();
    }
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-nature-600" />
            <p className="text-muted-foreground">Carregando detalhes da experiência...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h2 className="text-2xl font-bold mb-2">Experiência não encontrada</h2>
            <p className="text-muted-foreground mb-6">
              Não conseguimos encontrar a experiência que você está procurando.
            </p>
            <Button onClick={() => navigate('/experiences')}>
              Ver todas as experiências
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="bg-nature-50 py-3">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Link to="/" className="hover:text-nature-700">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/experiences" className="hover:text-nature-700">Experiências</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">{experience.title}</span>
            </div>
          </div>
        </div>
      
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4"
              onClick={() => navigate('/experiences')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Voltar para Experiências
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-6">
                <img 
                  src={experience.image} 
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                  {experience.category}
                </div>
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{experience.title}</h1>
                  <div className="flex items-center mt-2 text-sm">
                    <div className="flex items-center mr-4">
                      <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                      <span>{experience.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">({experience.reviewCount} avaliações)</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="text-nature-600 mr-1" />
                      <span>{experience.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-nature-50 px-4 py-2 rounded-lg">
                  <span className="text-lg font-bold">R$ {experience.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">/ por pessoa</span>
                </div>
              </div>
              
              <Tabs defaultValue="about" className="mt-6">
                <TabsList className="mb-6">
                  <TabsTrigger value="about">Sobre</TabsTrigger>
                  <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-muted-foreground">
                      {experience.description}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <ReviewsList 
                    experienceId={experience.id} 
                    averageRating={experience.rating} 
                    reviewCount={experience.reviewCount} 
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <div className="bg-white border border-border rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Reserve esta Experiência</h2>
                
                <div className="mb-4">
                  <div className="flex items-baseline mb-2">
                    <span className="text-2xl font-bold">R$ {experience.price}</span>
                    <span className="text-muted-foreground ml-1">/ por pessoa</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{experience.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">({experience.reviewCount} avaliações)</span>
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
                        <p className="text-xs text-muted-foreground">Participantes</p>
                        <p className="font-medium">2 pessoas</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mb-3">Reservar agora</Button>
                <Button variant="outline" className="w-full">
                  Entrar em contato
                </Button>
                
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-center text-sm text-muted-foreground">
                    Cancele gratuitamente até 24 horas antes do início da experiência.
                  </p>
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

export default ExperienceDetail;
