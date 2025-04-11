-- Políticas RLS para as tabelas de sincronização de progresso
-- Este arquivo contém as políticas de segurança para acesso às tabelas do sistema de progresso

-- Ativar RLS nas tabelas
ALTER TABLE public.student_progress_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- ==================== POLÍTICAS PARA TABELA STUDENT_PROGRESS_SYNC ====================

-- Usuários podem ver apenas seu próprio progresso
CREATE POLICY "Usuários veem seu próprio progresso" ON public.student_progress_sync
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Instrutores podem ver o progresso dos alunos nos seus cursos
CREATE POLICY "Instrutores veem progresso dos alunos nos seus cursos" ON public.student_progress_sync
  FOR SELECT TO authenticated
  USING (
    auth.uid() IN (
      SELECT c.instructor_id
      FROM public.contents co
      JOIN public.modules m ON co.module_id = m.id
      JOIN public.courses c ON m.course_id = c.id
      WHERE co.id = content_id
    )
  );

-- Usuários só podem inserir progresso para si mesmos
CREATE POLICY "Usuários inserem seu próprio progresso" ON public.student_progress_sync
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar seu próprio progresso
CREATE POLICY "Usuários atualizam seu próprio progresso" ON public.student_progress_sync
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================== POLÍTICAS PARA TABELA CONTENT_INTERACTIONS ====================

-- Usuários podem ver apenas suas próprias interações
CREATE POLICY "Usuários veem suas próprias interações" ON public.content_interactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Instrutores podem ver interações em seus conteúdos
CREATE POLICY "Instrutores veem interações em seus conteúdos" ON public.content_interactions
  FOR SELECT TO authenticated
  USING (
    auth.uid() IN (
      SELECT c.instructor_id
      FROM public.contents co
      JOIN public.modules m ON co.module_id = m.id
      JOIN public.courses c ON m.course_id = c.id
      WHERE co.id = content_id
    )
  );

-- Usuários só podem registrar interações para si mesmos
CREATE POLICY "Usuários registram suas próprias interações" ON public.content_interactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ==================== POLÍTICAS PARA TABELA SYNC_QUEUE ====================

-- Usuários só podem ver sua própria fila de sincronização
CREATE POLICY "Usuários veem sua própria fila de sincronização" ON public.sync_queue
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Usuários só podem adicionar à sua própria fila
CREATE POLICY "Usuários adicionam à sua própria fila" ON public.sync_queue
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar sua própria fila
CREATE POLICY "Usuários atualizam sua própria fila" ON public.sync_queue
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem excluir da sua própria fila
CREATE POLICY "Usuários excluem da sua própria fila" ON public.sync_queue
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ==================== POLÍTICAS PARA TABELA USER_SESSIONS ====================

-- Usuários só podem ver suas próprias sessões
CREATE POLICY "Usuários veem suas próprias sessões" ON public.user_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Usuários só podem criar suas próprias sessões
CREATE POLICY "Usuários criam suas próprias sessões" ON public.user_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar suas próprias sessões
CREATE POLICY "Usuários atualizam suas próprias sessões" ON public.user_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem excluir suas próprias sessões
CREATE POLICY "Usuários excluem suas próprias sessões" ON public.user_sessions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id); 