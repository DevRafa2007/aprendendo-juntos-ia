import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
}

/**
 * Componente para exibição e seleção de avaliações em estrelas
 */
const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  onChange,
  readonly = false,
  size = 'md',
  className,
  showLabel = false,
  labelClassName,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);

  // Determinar o tamanho das estrelas com base na prop size
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  // Criar uma array com o número de estrelas desejado
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  // Determinar se a estrela deve ser destacada (preenchida)
  const isStarHighlighted = (starPosition: number) => {
    if (hoverRating > 0) {
      return starPosition <= hoverRating;
    }
    return starPosition <= currentRating;
  };

  // Determinar o rótulo da classificação
  const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'Sem classificação';
    if (rating === 1) return 'Terrível';
    if (rating === 2) return 'Ruim';
    if (rating === 3) return 'Regular';
    if (rating === 4) return 'Bom';
    if (rating === 5) return 'Excelente';
    return `${rating} estrelas`;
  };

  // Lidar com o clique em uma estrela
  const handleClick = (starPosition: number) => {
    if (readonly) return;
    
    // Se clicar na mesma estrela novamente, remover a classificação
    const newRating = starPosition === currentRating ? 0 : starPosition;
    
    setCurrentRating(newRating);
    onChange?.(newRating);
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex">
        {stars.map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size], 
              'cursor-pointer transition-colors',
              isStarHighlighted(star) 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300',
              !readonly && 'hover:text-yellow-400'
            )}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
          />
        ))}
      </div>
      
      {showLabel && (
        <span className={cn('ml-2 text-sm', labelClassName)}>
          {getRatingLabel(hoverRating || currentRating)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 