import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  tags: string[];
  isFeatured?: boolean;
}

interface PropertyCardProps {
  property: Property;
  className?: string;
  featured?: boolean;
  index?: number;
}

const PropertyCard = ({ 
  property, 
  className,
  featured = false,
  index = 0
}: PropertyCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const delay = 200 * index;
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [index]);
  
  return (
    <Card
      className={cn(
        "bg-white shadow-md overflow-hidden transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      <Link to={`/property/${property.id}`}>
        <div className="relative">
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-52 object-cover rounded-t-md"
          />
          {featured && (
            <Badge className="absolute top-2 left-2 bg-emerald-500 text-white shadow-md">
              Destaque
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{property.name}</h3>
          <div className="flex items-center text-gray-600 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <p className="text-sm line-clamp-1">{property.location}</p>
          </div>
          <div className="flex items-center mt-2">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium text-gray-700">{property.rating.toFixed(1)}</span>
            <span className="text-gray-500 text-xs ml-1">({property.reviewCount} avaliações)</span>
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-nature-700 font-semibold text-lg">R$ {property.price.toFixed(2)}</span>
            <div className="flex space-x-2">
              {property.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default PropertyCard;
