
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  experienceId?: string;
  propertyId?: string;
  onReviewSubmitted: () => void;
  onSubmit?: (reviewData: any) => Promise<void>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  experienceId,
  propertyId,
  onReviewSubmitted,
  onSubmit 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tempRating, setTempRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para avaliar.",
        variant: "destructive"
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação por estrelas.",
        variant: "destructive"
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comentário necessário",
        description: "Por favor, adicione um comentário à sua avaliação.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // If custom onSubmit handler is provided, use it
      if (onSubmit) {
        await onSubmit({
          rating,
          comment,
          experience_id: experienceId,
          property_id: propertyId
        });
        
        // Reset form
        setRating(0);
        setComment('');
        
        // Notify parent component
        onReviewSubmitted();
        return;
      }

      // Get user profile information
      const { data: userData } = await supabase.auth.getUser();
      const userName = userData.user?.user_metadata?.full_name || 'Usuário';
      const userAvatar = userData.user?.user_metadata?.avatar_url;

      // Default submission logic
      const reviewData = {
        user_id: user.id,
        rating,
        comment,
        user_name: userName,
        user_avatar: userAvatar
      };

      // Add the correct ID based on context
      if (experienceId) {
        Object.assign(reviewData, { experience_id: experienceId });
      } else if (propertyId) {
        Object.assign(reviewData, { property_id: propertyId });
      }

      const { error } = await supabase
        .from('reviews')
        .insert(reviewData);

      if (error) throw error;

      toast({
        title: "Avaliação enviada",
        description: "Obrigado pelo seu feedback!"
      });

      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      onReviewSubmitted();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Compartilhe sua experiência</h3>
      
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Como você avalia esta experiência?</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setTempRating(star)}
              onMouseLeave={() => setTempRating(0)}
              className="p-1"
            >
              <Star 
                size={24} 
                className={cn(
                  "transition-all", 
                  (tempRating ? star <= tempRating : star <= rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0 ? `${rating} estrelas` : "Selecione uma classificação"}
          </span>
        </div>
      </div>
      
      <div>
        <Textarea
          placeholder="Compartilhe seus pensamentos sobre esta experiência..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting || rating === 0 || !comment.trim()}>
        {isSubmitting ? "Enviando..." : "Enviar avaliação"}
      </Button>
    </form>
  );
};

export default ReviewForm;
