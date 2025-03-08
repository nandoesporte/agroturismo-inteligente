
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotButton from '@/components/ChatbotButton';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const teamMembers = [
  {
    name: "Ana Santos",
    role: "Fundadora e CEO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80"
  },
  {
    name: "Carlos Oliveira",
    role: "Diretor de Operações",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80"
  },
  {
    name: "Mariana Lima",
    role: "Gerente de Parcerias",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1361&q=80"
  },
  {
    name: "Pedro Mendes",
    role: "Desenvolvedor Tech",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  }
];

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-nature-800 text-white py-16 md:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80" 
              alt="Paisagem rural do Paraná"
              className="w-full h-full object-cover object-center opacity-20"
            />
          </div>
          <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 playfair">
                Sobre o AgroRota
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Conectando turistas à autenticidade do campo paranaense através de experiências inesquecíveis e sustentáveis.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="py-16 md:py-24 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 playfair text-nature-800">Nossa História</h2>
              <p className="text-muted-foreground mb-4">
                O AgroRota nasceu em 2022 com uma missão clara: transformar o agroturismo no Paraná, criando pontes entre o campo e a cidade. Identificamos que havia um grande potencial inexplorado nas propriedades rurais paranaenses e uma crescente busca por experiências autênticas por parte dos turistas.
              </p>
              <p className="text-muted-foreground mb-4">
                Nossa fundadora, Ana Santos, cresceu em uma pequena propriedade rural no interior do Paraná e sempre sonhou em compartilhar a riqueza cultural e natural desses espaços com mais pessoas. Após anos trabalhando com turismo convencional, ela decidiu unir sua experiência profissional com sua paixão pelo campo e criar um serviço que valorizasse o agroturismo de forma moderna e acessível.
              </p>
              <p className="text-muted-foreground">
                Hoje, o AgroRota conecta centenas de propriedades rurais a milhares de visitantes anualmente, promovendo o turismo sustentável e apoiando as economias locais em todo o estado do Paraná.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Paisagem rural do Paraná"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
        
        {/* Our Mission */}
        <section className="py-16 md:py-24 bg-nature-50">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold playfair text-nature-800 mb-6">Nossa Missão e Valores</h2>
              <p className="text-muted-foreground">
                Acreditamos que o agroturismo é mais do que uma atividade recreativa – é uma forma de preservar tradições, gerar renda para comunidades rurais e proporcionar experiências transformadoras para os visitantes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-nature-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-nature-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Sustentabilidade</h3>
                <p className="text-muted-foreground">
                  Promovemos práticas turísticas que respeitam o meio ambiente e valorizam os recursos naturais, incentivando a preservação e a educação ambiental.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-nature-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-nature-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Autenticidade</h3>
                <p className="text-muted-foreground">
                  Valorizamos as experiências genuínas que revelam a verdadeira essência da vida rural, suas tradições, gastronomia e cultura.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-nature-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-nature-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Comunidade</h3>
                <p className="text-muted-foreground">
                  Fortalecemos as economias locais e ajudamos a criar oportunidades para as comunidades rurais, promovendo um desenvolvimento justo e inclusivo.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-16 md:py-24 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold playfair text-nature-800 mb-4">Nossa Equipe</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Somos um time apaixonado pelo campo e pela tecnologia, trabalhando para criar a melhor experiência possível para proprietários rurais e turistas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-nature-800 text-white">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold playfair mb-6">Faça Parte desta Jornada</h2>
              <p className="text-white/90 text-lg mb-8">
                Seja como visitante ou como proprietário rural, junte-se a nós na missão de transformar o agroturismo no Paraná.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/properties">
                    Explorar Propriedades
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                  Quero Cadastrar Minha Propriedade
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default About;
