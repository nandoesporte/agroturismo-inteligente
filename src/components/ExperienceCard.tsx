
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  rating: number;
  reviewCount: number;
  category: string;
}

interface ExperienceCardProps {
  experience: Experience;
  className?: string;
  horizontal?: boolean;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ 
  experience, 
  className,
  horizontal = false
}) => {
  return (
    <Link 
      to={`/experiences/${experience.id}`}
      className={cn(
        "group block rounded-xl overflow-hidden hover-scale trans",
        "shadow-sm hover:shadow-md",
        horizontal ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "",
        className
      )}
    >
      <div className={cn(
        "relative overflow-hidden",
        horizontal ? "md:rounded-l-xl md:rounded-tr-none" : "rounded-t-xl",
        horizontal ? "aspect-video md:aspect-auto md:h-full" : "aspect-[3/2]"
      )}>
        <img 
          src={experience.image} 
          alt={experience.title}
          className="w-full h-full object-cover trans group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
          {experience.category}
        </div>
      </div>
      
      <div className={cn(
        "p-4",
        horizontal ? "md:col-span-2" : ""
      )}>
        <div className="flex justify-between items-start mb-2">
          <h3 className={cn(
            "font-semibold group-hover:text-nature-700 trans",
            horizontal ? "text-xl" : "text-lg"
          )}>
            {experience.title}
          </h3>
          <div className="flex items-center space-x-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{experience.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({experience.reviewCount})</span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {experience.description}
        </p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Clock className="w-3.5 h-3.5 mr-1" />
          <span>{experience.duration}</span>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-baseline">
            <span className="font-medium">R$ {experience.price}</span>
            <span className="text-sm text-muted-foreground ml-1">/ por pessoa</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExperienceCard;
