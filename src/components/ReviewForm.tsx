
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import StarRating from './StarRating';
import { reviewService, CourseReview, CourseReviewInsert } from '@/services/reviewService';

// Review form validation schema
const reviewFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'O título deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'O título deve ter no máximo 100 caracteres' }),
  comment: z
    .string()
    .min(10, { message: 'A avaliação deve ter pelo menos 10 caracteres' })
    .max(1000, { message: 'A avaliação deve ter no máximo 1000 caracteres' }),
  rating: z
    .number()
    .min(1, { message: 'A classificação deve ser entre 1 e 5 estrelas' })
    .max(5),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  courseId: string;
  userId: string;
  initialData?: CourseReview;
  onSuccess?: (review: CourseReview) => void;
  onCancel?: () => void;
  className?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  courseId,
  userId,
  initialData,
  onSuccess,
  onCancel,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  // Setup form with zod resolver
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      comment: initialData?.comment || '',
      rating: initialData?.rating || 0,
    },
  });

  // Check if user can review this course
  useEffect(() => {
    const checkEligibility = async () => {
      if (!isEditing) {
        try {
          const canReview = await reviewService.canReviewCourse(courseId, userId);
          if (!canReview) {
            toast({
              title: "Não é possível avaliar este curso",
              description: "Você precisa estar matriculado neste curso para avaliá-lo.",
              variant: "destructive",
            });
            onCancel?.();
          }
        } catch (error) {
          console.error("Erro ao verificar elegibilidade:", error);
          toast({
            title: "Erro",
            description: "Não foi possível verificar sua elegibilidade para avaliar este curso.",
            variant: "destructive",
          });
        }
      }
    };

    checkEligibility();
  }, [courseId, userId, isEditing, onCancel]);

  // Check existing review
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!isEditing) {
        try {
          const existingReview = await reviewService.getUserReviewForCourse(courseId, userId);
          if (existingReview) {
            toast({
              title: "Avaliação encontrada",
              description: "Você já avaliou este curso. Você está editando sua avaliação anterior.",
            });
            
            // Fill form with existing data
            form.reset({
              title: existingReview.title,
              comment: existingReview.comment,
              rating: existingReview.rating,
            });
          }
        } catch (error) {
          console.error("Erro ao verificar avaliação existente:", error);
        }
      }
    };

    checkExistingReview();
  }, [courseId, userId, isEditing, form]);

  // Submit the form
  const onSubmit = async (values: ReviewFormValues) => {
    setIsSubmitting(true);

    try {
      // Check again if review already exists
      const existingReview = await reviewService.getUserReviewForCourse(courseId, userId);
      
      let savedReview: CourseReview;
      
      if (isEditing || existingReview) {
        // Update existing review
        const reviewId = initialData?.id || existingReview?.id;
        
        if (!reviewId) {
          throw new Error("ID da avaliação não encontrado");
        }
        
        savedReview = await reviewService.updateReview(reviewId, {
          ...values,
          updated_at: new Date().toISOString(),
        });
        
        toast({
          title: "Avaliação atualizada",
          description: "Sua avaliação foi atualizada com sucesso.",
        });
      } else {
        // Create new review
        const newReview: CourseReviewInsert = {
          course_id: courseId,
          user_id: userId,
          rating: values.rating,
          title: values.title,
          comment: values.comment,
          is_verified: false, // Will be verified by admin
          is_featured: false, // Will be featured by admin if good
        };
        
        savedReview = await reviewService.createReview(newReview);
        
        toast({
          title: "Avaliação enviada",
          description: "Sua avaliação foi enviada com sucesso. Obrigado pelo feedback!",
        });
      }
      
      // Success callback
      onSuccess?.(savedReview);
      
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua avaliação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar avaliação' : 'Avaliar curso'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo de classificação em estrelas */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classificação</FormLabel>
                  <FormControl>
                    <StarRating
                      rating={field.value}
                      onChange={field.onChange}
                      size="lg"
                      showLabel
                    />
                  </FormControl>
                  <FormDescription>
                    Avalie o curso de 1 a 5 estrelas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da avaliação</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Curso excelente para iniciantes" {...field} />
                  </FormControl>
                  <FormDescription>
                    Um título breve para sua avaliação
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de comentário */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sua avaliação detalhada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Compartilhe sua experiência com este curso..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descreva o que gostou ou o que poderia ser melhorado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting || !form.formState.isValid}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⟳</span> Salvando...
            </span>
          ) : isEditing ? (
            'Atualizar avaliação'
          ) : (
            'Enviar avaliação'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReviewForm;
