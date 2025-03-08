
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Descubra o Agroturismo no Paraná',
      subtitle: 'Experiências autênticas em meio à natureza e cultura rural'
    },
    {
      image: 'https://images.unsplash.com/photo-1515256722043-0991db08e6af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Sabores da Terra',
      subtitle: 'Conheça as delícias da gastronomia rural paranaense'
    },
    {
      image: 'https://images.unsplash.com/photo-1625592318868-c1e4aa2b3b33?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Paisagens Deslumbrantes',
      subtitle: 'Caminhos e trilhas para se conectar com a natureza'
    }
  ];

  // Auto-rotate slides
  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={currentSlide !== index}
        >
          <div className="absolute inset-0 bg-black/30 z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover object-center"
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        <div className={`max-w-4xl mx-auto transition-all duration-700 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="mb-8 flex justify-center">
            <img 
              src="/lovable-uploads/e519efc1-257a-49de-acaa-461d821b5ad9.png" 
              alt="AgroRota Logo" 
              className="h-24 w-auto" 
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            {slides[currentSlide].subtitle}
          </p>
          
          <div className={`transition-all duration-700 delay-300 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <SearchBar className="mb-8" />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" className="bg-nature-600 hover:bg-nature-700 text-white">
                Explorar Propriedades
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                Como Funciona
              </Button>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlide === index 
                  ? 'w-8 bg-white' 
                  : 'w-4 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
