import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from '@/components/ui/use-toast';
import { Star, Filter, SlidersHorizontal, Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import { reviewService, CourseReview, ReviewListOptions, PaginationResult } from '@/services/reviewService';

interface ReviewListProps {
  courseId: string;
  className?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ courseId, className }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [metrics, setMetrics] = useState<{
    avgRating: number;
    totalReviews: number;
    ratingCounts: { [key: string]: number };
  } | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Estados para filtros
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Carregar avaliações com base nos filtros atuais
  const loadReviews = async (page = 1) => {
    setLoading(true);
    
    try {
      // Configurar opções de filtro
      const options: ReviewListOptions = {
        courseId,
        page,
        limit: 10,
        sortBy,
        sortOrder,
        verifiedOnly,
      };
      
      // Adicionar filtro de classificação se houver
      if (ratingFilter.length > 0) {
        options.ratingFilter = ratingFilter;
      }
      
      // Buscar avaliações
      const result: PaginationResult<CourseReview> = await reviewService.listCourseReviews(options);
      
      setReviews(result.data);
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as avaliações. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar métricas de avaliação
  const loadMetrics = async () => {
    try {
      const data = await reviewService.getCourseReviewMetrics(courseId);
      if (data) {
        setMetrics({
          avgRating: data.avg_rating,
          totalReviews: data.total_reviews,
          ratingCounts: data.rating_counts as { [key: string]: number },
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas de avaliação:', error);
    }
  };
  
  // Carregar dados ao montar o componente ou quando os filtros mudarem
  useEffect(() => {
    loadReviews(1); // Voltar para a primeira página ao mudar filtros
    
    // Carregar métricas apenas uma vez
    if (!metrics) {
      loadMetrics();
    }
  }, [courseId, sortBy, sortOrder, ratingFilter, verifiedOnly]);
  
  // Função para atualizar a página
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadReviews(page);
  };
  
  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSortBy('date');
    setSortOrder('desc');
    setRatingFilter([]);
    setVerifiedOnly(false);
  };
  
  // Função para aplicar filtro de classificação
  const handleRatingFilterChange = (rating: number) => {
    setRatingFilter(prev => {
      // Se já existe no filtro, remover
      if (prev.includes(rating)) {
        return prev.filter(r => r !== rating);
      }
      // Caso contrário, adicionar
      return [...prev, rating];
    });
  };
  
  // Função para lidar com a submissão de uma nova avaliação
  const handleReviewSubmitted = (review: CourseReview) => {
    setShowReviewForm(false);
    
    // Atualizar lista de avaliações
    loadReviews(currentPage);
    
    // Atualizar métricas
    loadMetrics();
  };
  
  // Renderizar esqueletos de carregamento
  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-2/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="pt-2 flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        </Card>
      ));
  };
  
  // Renderizar métricas de avaliação
  const renderMetrics = () => {
    if (!metrics) return null;
    
    const { avgRating, totalReviews, ratingCounts } = metrics;
    
    return (
      <div className="p-4 bg-slate-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Avaliações dos alunos</h3>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`h-5 w-5 ${star <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">({totalReviews} avaliações)</span>
        </div>
        
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingCounts[rating.toString()] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="w-8 text-sm font-medium">{rating} ★</span>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Coluna de métricas e filtros em telas maiores */}
        <div className="md:w-1/3 space-y-4">
          {/* Métricas de avaliação */}
          {renderMetrics()}
          
          {/* Botão para adicionar avaliação */}
          {user && (
            <Button
              className="w-full"
              onClick={() => setShowReviewForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Avaliar este curso
            </Button>
          )}
          
          {/* Filtros em telas maiores */}
          <div className="hidden md:block">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Filtros</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sort-by">Ordenar por</Label>
                <Select value={sortBy} onValueChange={(value: 'date' | 'rating' | 'helpful') => setSortBy(value)}>
                  <SelectTrigger id="sort-by">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="rating">Classificação</SelectItem>
                    <SelectItem value="helpful">Mais útil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sort-order">Ordem</Label>
                <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                  <SelectTrigger id="sort-order">
                    <SelectValue placeholder="Ordem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Decrescente</SelectItem>
                    <SelectItem value="asc">Crescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Classificação</Label>
                <div className="flex flex-wrap gap-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <Badge
                      key={rating}
                      variant={ratingFilter.includes(rating) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-slate-100"
                      onClick={() => handleRatingFilterChange(rating)}
                    >
                      {rating} ★
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="verified-only"
                  checked={verifiedOnly}
                  onCheckedChange={setVerifiedOnly}
                />
                <Label htmlFor="verified-only">Apenas verificadas</Label>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Coluna principal com lista de avaliações */}
        <div className="flex-1 space-y-4">
          {/* Barra de filtros em telas menores */}
          <div className="md:hidden flex items-center justify-between">
            <h2 className="text-xl font-semibold">Avaliações</h2>
            
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" /> Filtrar
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Filtre as avaliações por classificação e outros critérios
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-sort-by">Ordenar por</Label>
                    <Select value={sortBy} onValueChange={(value: 'date' | 'rating' | 'helpful') => setSortBy(value)}>
                      <SelectTrigger id="mobile-sort-by">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Data</SelectItem>
                        <SelectItem value="rating">Classificação</SelectItem>
                        <SelectItem value="helpful">Mais útil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile-sort-order">Ordem</Label>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger id="mobile-sort-order">
                        <SelectValue placeholder="Ordem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Decrescente</SelectItem>
                        <SelectItem value="asc">Crescente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Classificação</Label>
                    <div className="flex flex-wrap gap-2">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <Badge
                          key={rating}
                          variant={ratingFilter.includes(rating) ? 'default' : 'outline'}
                          className="cursor-pointer hover:bg-slate-100"
                          onClick={() => handleRatingFilterChange(rating)}
                        >
                          {rating} ★
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="mobile-verified-only"
                      checked={verifiedOnly}
                      onCheckedChange={setVerifiedOnly}
                    />
                    <Label htmlFor="mobile-verified-only">Apenas verificadas</Label>
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    Aplicar filtros
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Lista de avaliações */}
          <div className="space-y-4">
            {loading ? (
              renderSkeletons()
            ) : reviews.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Nenhuma avaliação encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {ratingFilter.length > 0 || verifiedOnly
                    ? 'Tente ajustar os filtros para ver mais avaliações.'
                    : 'Seja o primeiro a avaliar este curso!'}
                </p>
                {user && !ratingFilter.length && !verifiedOnly && (
                  <Button onClick={() => setShowReviewForm(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar avaliação
                  </Button>
                )}
              </Card>
            ) : (
              reviews.map(review => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  currentUserId={user?.id}
                  onReviewClick={() => {
                    // Implementar visualização detalhada da avaliação
                  }}
                />
              ))
            )}
          </div>
          
          {/* Paginação */}
          {!loading && reviews.length > 0 && totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  // Mostrar páginas próximas à atual e primeira/última
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Mostrar elipses para páginas omitidas
                  if (page === 2 || page === totalPages - 1) {
                    return (
                      <PaginationItem key={page}>
                        <span className="px-4">...</span>
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
      
      {/* Modal de formulário de avaliação */}
      <Sheet open={showReviewForm} onOpenChange={setShowReviewForm}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Avaliar curso</SheetTitle>
            <SheetDescription>
              Compartilhe sua experiência com este curso para ajudar outros alunos
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            {user && (
              <ReviewForm
                courseId={courseId}
                userId={user.id}
                onSuccess={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ReviewList; 