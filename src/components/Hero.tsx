import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowDown, ChevronDown, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [showSlideIndicators, setShowSlideIndicators] = useState(false);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Descubra o Agroturismo no Paraná',
      subtitle: 'Experiências autênticas em meio à natureza e cultura rural'
    },
    {
      image: 'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Sabores da Terra',
      subtitle: 'Conheça as delícias da gastronomia rural paranaense'
    },
    {
      image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Paisagens Deslumbrantes',
      subtitle: 'Caminhos e trilhas para se conectar com a natureza'
    },
    {
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      title: 'Fazendas Históricas',
      subtitle: 'Conheça a história e a cultura das fazendas centenárias do Paraná'
    },
    {
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80',
      title: 'Vida Rural Autêntica',
      subtitle: 'Experiências genuínas de convivência com famílias rurais'
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollHint(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: i * 0.2
      }
    })
  };

  const scrollHintAnimation = {
    initial: { y: 0, opacity: 1 },
    animate: { 
      y: [0, 10, 0],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={currentSlide !== index}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover object-center"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1501554728187-ce583db33af7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
            }}
          />
        </div>
      ))}

      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          <motion.div 
            className="mb-4 sm:mb-6 flex justify-center"
            variants={fadeIn}
            custom={0}
          >
            <img 
              src="/lovable-uploads/e519efc1-257a-49de-acaa-461d821b5ad9.png" 
              alt="AgroRota Logo" 
              className="h-16 sm:h-20 md:h-24 w-auto" 
            />
          </motion.div>
          
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 md:mb-6 leading-tight tracking-tight"
            variants={fadeIn}
            custom={1}
          >
            {slides[currentSlide].title}
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto"
            variants={fadeIn}
            custom={2}
          >
            {slides[currentSlide].subtitle}
          </motion.p>
          
          <motion.div
            variants={fadeIn}
            custom={3}
          >
            <SearchBar className="mb-6 sm:mb-8" />

            {/* Botão do Identificador de Espécies */}
            <motion.div 
              className="mb-6 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/30 text-white group relative overflow-hidden"
                asChild
              >
                <Link to="/species-recognition" className="flex items-center gap-2">
                  <span className="relative z-10 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-300 group-hover:text-green-200 transition-colors" />
                    <span>Identificador de Espécies</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </Button>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 sm:mt-8">
              <Button 
                size="lg" 
                className="bg-nature-600 hover:bg-nature-700 text-white shadow-md w-full sm:w-auto"
                asChild
              >
                <Link to="/properties">
                  Explorar Propriedades
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm w-full sm:w-auto"
                asChild
              >
                <Link to="/about">
                  Como Funciona
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {showSlideIndicators && (
          <div className="absolute bottom-32 sm:bottom-28 left-0 right-0 flex justify-center space-x-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index 
                    ? 'w-6 sm:w-8 bg-white' 
                    : 'w-3 sm:w-4 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={currentSlide === index}
              />
            ))}
          </div>
        )}
        
        {showScrollHint && (
          <motion.div 
            className="absolute bottom-6 left-0 right-0 flex flex-col items-center text-white text-sm md:hidden"
            initial="initial"
            animate="animate"
            variants={scrollHintAnimation}
          >
            <span className="mb-1 text-xs font-light">Deslize para descobrir</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Hero;
