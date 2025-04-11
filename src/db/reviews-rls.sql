-- Políticas RLS para o sistema de avaliações e comentários
-- Este arquivo contém as políticas de segurança para acesso às tabelas de avaliações

-- Ativar RLS nas tabelas
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_review_metrics ENABLE ROW LEVEL SECURITY;

-- ==================== POLÍTICAS PARA TABELA COURSE_REVIEWS ====================

-- Avaliações são visíveis para todos
CREATE POLICY "Avaliações visíveis para todos" ON public.course_reviews
  FOR SELECT USING (true);

-- Usuários autenticados podem criar avaliações apenas para os cursos em que estão matriculados
CREATE POLICY "Usuários podem criar avaliações para cursos matriculados" ON public.course_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE user_id = auth.uid() AND course_id = course_reviews.course_id
    )
  );

-- Usuários só podem atualizar suas próprias avaliações
CREATE POLICY "Usuários atualizam suas próprias avaliações" ON public.course_reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem excluir suas próprias avaliações
CREATE POLICY "Usuários excluem suas próprias avaliações" ON public.course_reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Instrutores podem ver, mas não podem modificar avaliações dos seus cursos
CREATE POLICY "Instrutores veem avaliações dos seus cursos" ON public.course_reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_reviews.course_id AND instructor_id = auth.uid()
    )
  );

-- ==================== POLÍTICAS PARA TABELA REVIEW_COMMENTS ====================

-- Comentários são visíveis para todos
CREATE POLICY "Comentários visíveis para todos" ON public.review_comments
  FOR SELECT USING (NOT is_deleted);

-- Usuários autenticados podem criar comentários
CREATE POLICY "Usuários autenticados podem criar comentários" ON public.review_comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar seus próprios comentários
CREATE POLICY "Usuários atualizam seus próprios comentários" ON public.review_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem marcar como excluídos seus próprios comentários (soft delete)
CREATE POLICY "Usuários marcam seus próprios comentários como excluídos" ON public.review_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND is_deleted = false)
  WITH CHECK (auth.uid() = user_id AND NEW.is_deleted = true);

-- ==================== POLÍTICAS PARA TABELA REVIEW_REACTIONS ====================

-- Reações são visíveis para todos
CREATE POLICY "Reações visíveis para todos" ON public.review_reactions
  FOR SELECT USING (true);

-- Usuários autenticados podem criar reações
CREATE POLICY "Usuários autenticados podem criar reações" ON public.review_reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar suas próprias reações
CREATE POLICY "Usuários atualizam suas próprias reações" ON public.review_reactions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem excluir suas próprias reações
CREATE POLICY "Usuários excluem suas próprias reações" ON public.review_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ==================== POLÍTICAS PARA TABELA REVIEW_REPORTS ====================

-- Relatórios são visíveis apenas para administradores e o usuário que reportou
CREATE POLICY "Usuários veem seus próprios relatórios" ON public.review_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

-- Usuários autenticados podem criar relatórios
CREATE POLICY "Usuários autenticados podem criar relatórios" ON public.review_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Usuários só podem excluir seus próprios relatórios pendentes
CREATE POLICY "Usuários excluem seus próprios relatórios pendentes" ON public.review_reports
  FOR DELETE TO authenticated
  USING (auth.uid() = reporter_id AND status = 'pending');

-- ==================== POLÍTICAS PARA TABELA COURSE_REVIEW_METRICS ====================

-- Métricas são visíveis para todos
CREATE POLICY "Métricas visíveis para todos" ON public.course_review_metrics
  FOR SELECT USING (true);

-- Apenas sistema pode atualizar métricas
-- As atualizações são feitas automaticamente via triggers 