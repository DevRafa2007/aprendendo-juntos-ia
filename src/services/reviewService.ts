import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Tipos para reviews e comentários
export type CourseReview = Tables<'course_reviews'>;
export type ReviewComment = Tables<'review_comments'>;
export type ReviewReaction = Tables<'review_reactions'>;
export type CourseReviewMetrics = Tables<'course_review_metrics'>;

// Tipo para inserção de review
export type CourseReviewInsert = TablesInsert<'course_reviews'>;

// Tipo para inserção de comentário
export type ReviewCommentInsert = TablesInsert<'review_comments'>;

// Tipo para reações
export type ReactionType = 'helpful' | 'unhelpful';

// Tipo para filtragem e ordenação de reviews
export interface ReviewListOptions {
  courseId: string;
  limit?: number;
  page?: number;
  sortBy?: 'date' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  ratingFilter?: number[];
  verifiedOnly?: boolean;
}

// Interface para paginação
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Serviço para gerenciar avaliações e comentários de cursos
 */
class ReviewService {
  /**
   * Cria uma nova avaliação para um curso
   * @param data Dados da avaliação
   * @returns Avaliação criada
   */
  async createReview(data: CourseReviewInsert): Promise<CourseReview> {
    const { data: review, error } = await supabase
      .from('course_reviews')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar avaliação:', error);
      throw new Error(`Falha ao criar avaliação: ${error.message}`);
    }

    return review;
  }

  /**
   * Obtém uma avaliação específica pelo ID
   * @param reviewId ID da avaliação
   * @returns Avaliação encontrada ou null
   */
  async getReviewById(reviewId: string): Promise<CourseReview | null> {
    const { data, error } = await supabase
      .from('course_reviews')
      .select(`
        *,
        user:profiles(id, name, avatar_url),
        reactions:review_reactions(id, user_id, reaction_type),
        comments:review_comments(
          id, comment, created_at, is_deleted,
          user:profiles(id, name, avatar_url)
        )
      `)
      .eq('id', reviewId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      console.error('Erro ao buscar avaliação:', error);
      throw new Error(`Falha ao buscar avaliação: ${error.message}`);
    }

    return data;
  }

  /**
   * Atualiza uma avaliação existente
   * @param reviewId ID da avaliação
   * @param data Dados a serem atualizados
   * @returns Avaliação atualizada
   */
  async updateReview(reviewId: string, data: TablesUpdate<'course_reviews'>): Promise<CourseReview> {
    const { data: review, error } = await supabase
      .from('course_reviews')
      .update(data)
      .eq('id', reviewId)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw new Error(`Falha ao atualizar avaliação: ${error.message}`);
    }

    return review;
  }

  /**
   * Exclui uma avaliação
   * @param reviewId ID da avaliação
   * @returns true se excluído com sucesso
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    const { error } = await supabase
      .from('course_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Erro ao excluir avaliação:', error);
      throw new Error(`Falha ao excluir avaliação: ${error.message}`);
    }

    return true;
  }

  /**
   * Lista avaliações de um curso com paginação e filtros
   * @param options Opções de filtragem e ordenação
   * @returns Resultado paginado de avaliações
   */
  async listCourseReviews(options: ReviewListOptions): Promise<PaginationResult<CourseReview>> {
    const {
      courseId,
      limit = 10,
      page = 1,
      sortBy = 'date',
      sortOrder = 'desc',
      ratingFilter,
      verifiedOnly = false
    } = options;

    // Calcular o offset para paginação
    const offset = (page - 1) * limit;

    // Iniciar a query
    let query = supabase
      .from('course_reviews')
      .select(`
        *,
        user:profiles(id, name, avatar_url),
        reactions:review_reactions(id, user_id, reaction_type),
        comments:review_comments!inner(
          id, user_id, comment, created_at, is_deleted,
          user:profiles(id, name, avatar_url)
        ),
        count() OVER()
      `, { count: 'exact' })
      .eq('course_id', courseId);

    // Aplicar filtros adicionais
    if (verifiedOnly) {
      query = query.eq('is_verified', true);
    }

    if (ratingFilter && ratingFilter.length > 0) {
      query = query.in('rating', ratingFilter);
    }

    // Aplicar ordenação
    if (sortBy === 'date') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'rating') {
      query = query.order('rating', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'helpful') {
      // Ordenação por mais útil requer junção adicional
      // Implementar contagem de reações úteis
      query = query.order('created_at', { ascending: false });
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1);

    // Executar a query
    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao listar avaliações:', error);
      throw new Error(`Falha ao listar avaliações: ${error.message}`);
    }

    // Calcular total de páginas
    const totalPages = count ? Math.ceil(count / limit) : 0;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Obtém as métricas de avaliação de um curso
   * @param courseId ID do curso
   * @returns Métricas de avaliação
   */
  async getCourseReviewMetrics(courseId: string): Promise<CourseReviewMetrics | null> {
    const { data, error } = await supabase
      .from('course_review_metrics')
      .select('*')
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao obter métricas de avaliação:', error);
      throw new Error(`Falha ao obter métricas de avaliação: ${error.message}`);
    }

    return data;
  }

  /**
   * Adiciona um comentário a uma avaliação
   * @param data Dados do comentário
   * @returns Comentário criado
   */
  async addComment(data: ReviewCommentInsert): Promise<ReviewComment> {
    const { data: comment, error } = await supabase
      .from('review_comments')
      .insert(data)
      .select(`
        *,
        user:profiles(id, name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw new Error(`Falha ao adicionar comentário: ${error.message}`);
    }

    return comment;
  }

  /**
   * Obtém comentários de uma avaliação
   * @param reviewId ID da avaliação
   * @returns Lista de comentários
   */
  async getReviewComments(reviewId: string): Promise<ReviewComment[]> {
    const { data, error } = await supabase
      .from('review_comments')
      .select(`
        *,
        user:profiles(id, name, avatar_url),
        children:review_comments(
          id, comment, created_at, user_id, parent_id, is_deleted,
          user:profiles(id, name, avatar_url)
        )
      `)
      .eq('review_id', reviewId)
      .is('parent_id', null) // Apenas comentários raiz
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar comentários:', error);
      throw new Error(`Falha ao buscar comentários: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Marca um comentário como excluído (soft delete)
   * @param commentId ID do comentário
   * @returns Comentário atualizado
   */
  async deleteComment(commentId: string): Promise<ReviewComment> {
    const { data: comment, error } = await supabase
      .from('review_comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao excluir comentário:', error);
      throw new Error(`Falha ao excluir comentário: ${error.message}`);
    }

    return comment;
  }

  /**
   * Adiciona ou atualiza uma reação a uma avaliação
   * @param reviewId ID da avaliação
   * @param userId ID do usuário
   * @param reactionType Tipo de reação ('helpful' ou 'unhelpful')
   * @returns Reação criada ou atualizada
   */
  async addReaction(reviewId: string, userId: string, reactionType: ReactionType): Promise<ReviewReaction> {
    // Verificar se o usuário já reagiu a esta avaliação
    const { data: existingReaction } = await supabase
      .from('review_reactions')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingReaction) {
      // Se já existe uma reação, atualizá-la
      const { data: reaction, error } = await supabase
        .from('review_reactions')
        .update({ reaction_type: reactionType })
        .eq('id', existingReaction.id)
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao atualizar reação:', error);
        throw new Error(`Falha ao atualizar reação: ${error.message}`);
      }

      return reaction;
    } else {
      // Caso contrário, criar uma nova reação
      const { data: reaction, error } = await supabase
        .from('review_reactions')
        .insert({
          review_id: reviewId,
          user_id: userId,
          reaction_type: reactionType
        })
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao adicionar reação:', error);
        throw new Error(`Falha ao adicionar reação: ${error.message}`);
      }

      return reaction;
    }
  }

  /**
   * Remove uma reação de uma avaliação
   * @param reviewId ID da avaliação
   * @param userId ID do usuário
   * @returns true se removido com sucesso
   */
  async removeReaction(reviewId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('review_reactions')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao remover reação:', error);
      throw new Error(`Falha ao remover reação: ${error.message}`);
    }

    return true;
  }

  /**
   * Verifica se o usuário já avaliou um curso
   * @param courseId ID do curso
   * @param userId ID do usuário
   * @returns Avaliação existente ou null
   */
  async getUserReviewForCourse(courseId: string, userId: string): Promise<CourseReview | null> {
    const { data, error } = await supabase
      .from('course_reviews')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar avaliação do usuário:', error);
      throw new Error(`Falha ao verificar avaliação: ${error.message}`);
    }

    return data;
  }

  /**
   * Denunciar uma avaliação ou comentário
   * @param reportData Dados da denúncia
   * @returns ID da denúncia criada
   */
  async reportContent(reportData: {
    reviewId?: string;
    commentId?: string;
    reporterId: string;
    reason: string;
    details?: string;
  }): Promise<string> {
    const { reviewId, commentId, reporterId, reason, details } = reportData;

    if (!reviewId && !commentId) {
      throw new Error('É necessário fornecer reviewId ou commentId');
    }

    const { data, error } = await supabase
      .from('review_reports')
      .insert({
        review_id: reviewId || null,
        comment_id: commentId || null,
        reporter_id: reporterId,
        reason,
        details: details || null,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao denunciar conteúdo:', error);
      throw new Error(`Falha ao denunciar conteúdo: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Verificar se o usuário pode avaliar um curso
   * (usuário deve estar matriculado)
   * @param courseId ID do curso
   * @param userId ID do usuário
   * @returns true se pode avaliar
   */
  async canReviewCourse(courseId: string, userId: string): Promise<boolean> {
    // Verificar se o usuário está matriculado no curso
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar matrícula:', error);
      throw new Error(`Falha ao verificar matrícula: ${error.message}`);
    }

    return !!data;
  }
}

// Exportar instância do serviço
export const reviewService = new ReviewService();

// Também exportar a classe para testes e casos especiais
export { ReviewService }; 