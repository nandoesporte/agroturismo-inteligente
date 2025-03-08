
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
  
  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-2 md:p-3 flex flex-col md:flex-row"
      >
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Location */}
          <div 
            className={cn(
              "flex items-center space-x-2 p-3 rounded-xl cursor-pointer transition-all",
              activeField === 'location' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted',
              "flex-1 md:border-r border-border"
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
              "flex-1 md:border-r border-border"
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
        <div className="p-2 md:pl-4 flex items-center justify-center">
          <Button 
            className="w-full h-12 md:w-auto rounded-xl bg-nature-600 hover:bg-nature-700 shadow-md"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Buscar</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchBar;
