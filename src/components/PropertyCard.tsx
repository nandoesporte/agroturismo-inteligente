
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  tags: string[];
  isFeatured?: boolean;
}

interface PropertyCardProps {
  property: Property;
  className?: string;
  featured?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  className,
  featured = false
}) => {
  return (
    <Link 
      to={`/properties/${property.id}`}
      className={cn(
        "group block rounded-xl overflow-hidden hover-scale trans",
        featured ? "shadow-lg" : "shadow-sm hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
        <img 
          src={property.image} 
          alt={property.name}
          className="w-full h-full object-cover trans group-hover:scale-105"
        />
        {property.isFeatured && (
          <span className="absolute top-3 left-3 bg-nature-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            Destaque
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-nature-700 trans">
            {property.name}
          </h3>
          <div className="flex items-center space-x-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{property.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({property.reviewCount})</span>
          </div>
        </div>
        
        <div className="mt-1 flex items-center text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 mr-1" />
          <span>{property.location}</span>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1.5">
          {property.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
          {property.tags.length > 3 && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              +{property.tags.length - 3}
            </span>
          )}
        </div>
        
        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-baseline">
            <span className="font-medium">R$ {property.price}</span>
            <span className="text-sm text-muted-foreground ml-1">/ por pessoa</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
