
import React, { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const [activeField, setActiveField] = useState<string | null>(null);
  
  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="bg-white shadow-lg rounded-xl p-2 flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Location */}
          <div 
            className={cn(
              "flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all",
              activeField === 'location' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted',
              "flex-1 md:border-r border-border"
            )}
            onClick={() => setActiveField('location')}
          >
            <MapPin className="h-5 w-5 text-nature-500" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Localização</span>
              <span className="text-sm">Em qualquer lugar</span>
            </div>
          </div>
          
          {/* Check-in */}
          <div 
            className={cn(
              "flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all",
              activeField === 'checkin' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted',
              "flex-1 md:border-r border-border"
            )}
            onClick={() => setActiveField('checkin')}
          >
            <Calendar className="h-5 w-5 text-nature-500" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Data</span>
              <span className="text-sm">Qualquer período</span>
            </div>
          </div>
          
          {/* Guests */}
          <div 
            className={cn(
              "flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all",
              activeField === 'guests' ? 'bg-nature-50 text-nature-800' : 'hover:bg-muted',
              "flex-1"
            )}
            onClick={() => setActiveField('guests')}
          >
            <Users className="h-5 w-5 text-nature-500" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Visitantes</span>
              <span className="text-sm">Adicionar visitantes</span>
            </div>
          </div>
        </div>
        
        {/* Search Button */}
        <div className="p-2 md:pl-4 flex items-center justify-center">
          <Button 
            size="icon" 
            className="w-full md:w-auto rounded-full bg-nature-600 hover:bg-nature-700"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
            <span className="hidden md:inline ml-2">Buscar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
