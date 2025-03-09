
import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className={cn("w-full max-w-4xl mx-auto relative", className)}>
      {/* Mobile collapsed view */}
      <div className="md:hidden">
        {!isExpanded ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/95 backdrop-blur-md shadow-lg rounded-full p-2 flex items-center"
            onClick={toggleExpand}
          >
            <div className="p-2 rounded-full bg-nature-100 text-nature-600 ml-2">
              <Search className="h-5 w-5" />
            </div>
            <div className="ml-3 flex-1">
              <span className="text-sm font-medium">Para onde você quer ir?</span>
            </div>
            <Button 
              className="rounded-full w-10 h-10 p-0 bg-nature-600 hover:bg-nature-700 shadow-md flex items-center justify-center"
              aria-label="Expandir busca"
              onClick={toggleExpand}
            >
              <Search className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0, height: 0 }}
            animate={{ y: 0, opacity: 1, height: "auto" }}
            className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-3 flex flex-col"
          >
            {/* Location */}
            <div 
              className={cn(
                "flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all mb-2",
                activeField === 'location' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted'
              )}
              onClick={() => setActiveField('location')}
            >
              <div className="p-2 rounded-full bg-nature-100 text-nature-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">Localização</span>
                <span className="text-sm font-medium">Em qualquer lugar</span>
              </div>
            </div>
            
            {/* Check-in */}
            <div 
              className={cn(
                "flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all mb-2",
                activeField === 'checkin' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted'
              )}
              onClick={() => setActiveField('checkin')}
            >
              <div className="p-2 rounded-full bg-nature-100 text-nature-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">Data</span>
                <span className="text-sm font-medium">Qualquer período</span>
              </div>
            </div>
            
            {/* Guests */}
            <div 
              className={cn(
                "flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all mb-2",
                activeField === 'guests' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted'
              )}
              onClick={() => setActiveField('guests')}
            >
              <div className="p-2 rounded-full bg-nature-100 text-nature-600">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">Visitantes</span>
                <span className="text-sm font-medium">Adicionar visitantes</span>
              </div>
            </div>
            
            <div className="p-2 flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={toggleExpand}
                className="text-sm"
              >
                Cancelar
              </Button>
              <Button 
                className="rounded-xl bg-nature-600 hover:bg-nature-700 shadow-md"
                aria-label="Buscar"
              >
                <Search className="h-4 w-4 mr-2" />
                <span>Buscar</span>
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Desktop view - always expanded */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="hidden md:flex bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-3 flex-row"
      >
        <div className="flex-1 flex flex-row">
          {/* Location */}
          <div 
            className={cn(
              "flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all",
              activeField === 'location' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted',
              "flex-1 border-r border-border"
            )}
            onClick={() => setActiveField('location')}
          >
            <div className="p-2 rounded-full bg-nature-100 text-nature-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Localização</span>
              <span className="text-sm font-medium">Em qualquer lugar</span>
            </div>
          </div>
          
          {/* Check-in */}
          <div 
            className={cn(
              "flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all",
              activeField === 'checkin' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted',
              "flex-1 border-r border-border"
            )}
            onClick={() => setActiveField('checkin')}
          >
            <div className="p-2 rounded-full bg-nature-100 text-nature-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Data</span>
              <span className="text-sm font-medium">Qualquer período</span>
            </div>
          </div>
          
          {/* Guests */}
          <div 
            className={cn(
              "flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all",
              activeField === 'guests' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted',
              "flex-1"
            )}
            onClick={() => setActiveField('guests')}
          >
            <div className="p-2 rounded-full bg-nature-100 text-nature-600">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Visitantes</span>
              <span className="text-sm font-medium">Adicionar visitantes</span>
            </div>
          </div>
        </div>
        
        {/* Search Button */}
        <div className="pl-4 flex items-center justify-center">
          <Button 
            className="h-12 w-auto rounded-xl bg-nature-600 hover:bg-nature-700 shadow-md"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5 mr-2" />
            <span>Buscar</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchBar;
