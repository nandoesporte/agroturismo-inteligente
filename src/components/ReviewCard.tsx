
import React from 'react';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Review {
  id: string;
  user_id?: string;
  experience_id: string;
  rating: number;
  comment: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
  className?: string;
}

const ReviewCard = ({ review, className }: ReviewCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className={cn("border-b border-border pb-6", className)}>
      <div className="flex items-start">
        {review.user_avatar ? (
          <img 
            src={review.user_avatar} 
            alt={review.user_name}
            className="w-10 h-10 rounded-full object-cover mr-4"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div>
          <div className="flex items-center">
            <h3 className="font-medium">{review.user_name}</h3>
            <span className="text-muted-foreground text-sm ml-2">
              {formatDate(review.created_at)}
            </span>
          </div>
          <div className="flex mt-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                size={14}
                className={cn(
                  i < review.rating 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
