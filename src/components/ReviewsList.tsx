
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReviewCard, { Review } from './ReviewCard';
import ReviewForm from './ReviewForm';

interface ReviewsListProps {
  experienceId: string;
  averageRating: number;
  reviewCount: number;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ 
  experienceId, 
  averageRating, 
  reviewCount 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Erro ao carregar avaliações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (experienceId) {
      fetchReviews();
    }
  }, [experienceId]);

  const handleShowMore = () => {
    setVisibleReviews(prev => prev + 3);
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Avaliações dos Visitantes</h2>
        <div className="flex items-center text-lg">
          <Star size={20} className="text-yellow-400 fill-yellow-400 mr-1" />
          <span className="font-medium">{averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground ml-1 text-sm">({reviewCount} avaliações)</span>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-nature-600" />
          <span className="ml-2">Carregando avaliações...</span>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.slice(0, visibleReviews).map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
          
          {visibleReviews < reviews.length && (
            <div className="text-center mt-4">
              <Button variant="outline" onClick={handleShowMore}>
                Ver mais avaliações
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground py-4">
          Esta experiência ainda não possui avaliações. Seja o primeiro a avaliar!
        </p>
      )}
      
      <div className="pt-6 border-t border-border">
        <ReviewForm 
          experienceId={experienceId} 
          onReviewSubmitted={handleReviewSubmitted} 
        />
      </div>
    </div>
  );
};

export default ReviewsList;
