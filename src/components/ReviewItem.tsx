
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThumbsUp, ThumbsDown, Flag, MoreVertical, MessageSquare, Check, MoreHorizontal } from 'lucide-react';
import StarRating from './StarRating';
import { CourseReview, ReviewReaction } from '@/services/reviewService';
import { reviewService } from '@/services/reviewService';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ReviewItemProps {
  review: CourseReview;
  currentUserId?: string;
  onReviewClick?: () => void;
  className?: string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  currentUserId,
  onReviewClick,
  className,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentReview, setCurrentReview] = useState<CourseReview>(review);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  
  // Check if current user is the author
  const isAuthor = currentUserId && currentUserId === review.user_id;
  
  // Check if current user has already reacted
  const userReaction = currentReview.reactions?.find(r => r.user_id === currentUserId)?.reaction_type;
  
  // Format creation date
  const formattedDate = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
    locale: ptBR,
  });
  
  // Add or remove reaction
  const handleReaction = async (reactionType: 'helpful' | 'unhelpful') => {
    if (!currentUserId) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para reagir a uma avaliação.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // If user already reacted with this type, remove reaction
      if (userReaction === reactionType) {
        await reviewService.removeReaction(currentReview.id, currentUserId);
        
        // Update local state
        const updatedReactions = currentReview.reactions?.filter(
          r => !(r.user_id === currentUserId && r.reaction_type === reactionType)
        ) || [];
        
        setCurrentReview({
          ...currentReview,
          reactions: updatedReactions,
        });
      } 
      // Caso contrário, adiciona ou atualiza a reação
      else {
        await reviewService.addReaction(currentReview.id, currentUserId, reactionType);
        
        // Update local state
        let updatedReactions = [...(currentReview.reactions || [])];
        const existingIndex = updatedReactions.findIndex(r => r.user_id === currentUserId);
        
        if (existingIndex >= 0) {
          updatedReactions[existingIndex] = {
            ...updatedReactions[existingIndex],
            reaction_type: reactionType
          };
        } else {
          updatedReactions.push({
            review_id: currentReview.id,
            user_id: currentUserId,
            reaction_type: reactionType,
            created_at: new Date().toISOString(),
          });
        }
        
        setCurrentReview({
          ...currentReview,
          reactions: updatedReactions,
        });
      }
    } catch (error) {
      console.error('Erro ao reagir à avaliação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Send report
  const handleReport = async () => {
    if (!currentUserId) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para denunciar uma avaliação.",
        variant: "destructive",
      });
      return;
    }
    
    if (!reportReason) {
      toast({
        title: "Motivo necessário",
        description: "Por favor, selecione um motivo para a denúncia.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await reviewService.reportContent({
        reviewId: currentReview.id,
        reporterId: currentUserId,
        reason: reportReason,
      });
      
      toast({
        title: "Denúncia enviada",
        description: "Obrigado por ajudar a manter a qualidade do conteúdo.",
        variant: "default",
      });
      
      setShowReportForm(false);
      setReportReason('');
    } catch (error) {
      console.error('Erro ao denunciar avaliação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua denúncia. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Count reactions
  const helpfulCount = currentReview.reactions?.filter(r => r.reaction_type === 'helpful').length || 0;
  const unhelpfulCount = currentReview.reactions?.filter(r => r.reaction_type === 'unhelpful').length || 0;
  
  return (
    <Card className={`p-4 ${className || ''}`} onClick={onReviewClick}>
      <div className="flex items-start gap-3">
        {/* Avatar e informações do usuário */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={currentReview.user?.avatar_url || ''} alt={currentReview.user?.full_name || 'Usuário'} />
          <AvatarFallback>
            {currentReview.user?.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">
                  {currentReview.user?.full_name || 'Usuário Anônimo'}
                </h4>
                {currentReview.is_verified && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Check className="mr-1 h-3 w-3" /> Verificado
                  </Badge>
                )}
                {currentReview.is_featured && (
                  <Badge variant="secondary" className="text-xs">
                    Destaque
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <StarRating rating={currentReview.rating} readonly size="sm" />
                <span className="text-xs">{formattedDate}</span>
              </div>
            </div>
          </div>
          
          {/* Título e conteúdo */}
          <h3 className="font-semibold mt-3 mb-1">{currentReview.title}</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {currentReview.comment}
          </p>
          
          {/* Ações */}
          <div className="flex flex-wrap gap-2 mt-4 justify-between">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1 text-xs ${userReaction === 'helpful' ? 'bg-green-50 text-green-700' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction('helpful');
                }}
                disabled={isSubmitting}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Útil {helpfulCount > 0 && `(${helpfulCount})`}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1 text-xs ${userReaction === 'unhelpful' ? 'bg-red-50 text-red-700' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction('unhelpful');
                }}
                disabled={isSubmitting}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>Não útil {unhelpfulCount > 0 && `(${unhelpfulCount})`}</span>
              </Button>
              
              {/* Botão de comentário - para implementação futura */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toast({
                    title: "Em breve",
                    description: "Comentários em avaliações estarão disponíveis em breve!",
                  });
                }}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Comentar</span>
              </Button>
            </div>
            
            <Popover open={showReportForm} onOpenChange={setShowReportForm}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={(e) => e.stopPropagation()}
                  disabled={isAuthor || isSubmitting}
                >
                  <Flag className="h-4 w-4" />
                  <span>Denunciar</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-3">
                  <h4 className="font-medium">Denunciar avaliação</h4>
                  <p className="text-sm text-muted-foreground">
                    Por que você está denunciando esta avaliação?
                  </p>
                  
                  <div className="space-y-2">
                    {['Conteúdo inapropriado', 'Spam', 'Informações falsas', 'Linguagem ofensiva', 'Outro'].map((reason) => (
                      <div key={reason} className="flex items-center">
                        <input
                          type="radio"
                          id={`reason-${reason}`}
                          name="reason"
                          value={reason}
                          className="mr-2"
                          checked={reportReason === reason}
                          onChange={() => setReportReason(reason)}
                        />
                        <label htmlFor={`reason-${reason}`} className="text-sm">
                          {reason}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowReportForm(false);
                        setReportReason('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleReport}
                      disabled={!reportReason || isSubmitting}
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReviewItem;
