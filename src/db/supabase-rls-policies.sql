-- Configuração das políticas de Row Level Security (RLS) para o Supabase

-- Ativar RLS para todas as tabelas relevantes
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==================== POLÍTICAS PARA TABELA CURSOS ====================

-- Todos podem visualizar cursos
CREATE POLICY "Cursos visíveis para todos" ON public.courses
  FOR SELECT USING (true);

-- Somente o instrutor pode criar cursos
CREATE POLICY "Usuários autenticados podem criar cursos" ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = instructor_id);

-- Somente o instrutor pode atualizar seu próprio curso
CREATE POLICY "Somente o instrutor pode atualizar seu curso" ON public.courses
  FOR UPDATE TO authenticated
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

-- Somente o instrutor pode deletar seu próprio curso
CREATE POLICY "Somente o instrutor pode deletar seu curso" ON public.courses
  FOR DELETE TO authenticated
  USING (auth.uid() = instructor_id);

-- ==================== POLÍTICAS PARA TABELA MÓDULOS ====================

-- Os módulos são visíveis para todos (usuários podem visualizar a estrutura do curso)
CREATE POLICY "Módulos visíveis para todos" ON public.modules
  FOR SELECT USING (true);

-- Somente o instrutor do curso pode criar módulos
CREATE POLICY "Instrutor pode criar módulos" ON public.modules
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT instructor_id FROM public.courses WHERE id = course_id
    )
  );

-- Somente o instrutor do curso pode atualizar módulos
CREATE POLICY "Instrutor pode atualizar módulos" ON public.modules
  FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (
      SELECT instructor_id FROM public.courses WHERE id = course_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT instructor_id FROM public.courses WHERE id = course_id
    )
  );

-- Somente o instrutor do curso pode deletar módulos
CREATE POLICY "Instrutor pode deletar módulos" ON public.modules
  FOR DELETE TO authenticated
  USING (
    auth.uid() IN (
      SELECT instructor_id FROM public.courses WHERE id = course_id
    )
  );

-- ==================== POLÍTICAS PARA TABELA AULAS ====================

-- As aulas são visíveis para todos (usuários podem visualizar a estrutura do curso)
CREATE POLICY "Aulas visíveis para todos" ON public.lessons
  FOR SELECT USING (true);

-- Somente o instrutor do curso pode criar aulas
CREATE POLICY "Instrutor pode criar aulas" ON public.lessons
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT c.instructor_id 
      FROM public.courses c
      JOIN public.modules m ON c.id = m.course_id
      WHERE m.id = module_id
    )
  );

-- Somente o instrutor do curso pode atualizar aulas
CREATE POLICY "Instrutor pode atualizar aulas" ON public.lessons
  FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (
      SELECT c.instructor_id 
      FROM public.courses c
      JOIN public.modules m ON c.id = m.course_id
      WHERE m.id = module_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT c.instructor_id 
      FROM public.courses c
      JOIN public.modules m ON c.id = m.course_id
      WHERE m.id = module_id
    )
  );

-- Somente o instrutor do curso pode deletar aulas
CREATE POLICY "Instrutor pode deletar aulas" ON public.lessons
  FOR DELETE TO authenticated
  USING (
    auth.uid() IN (
      SELECT c.instructor_id 
      FROM public.courses c
      JOIN public.modules m ON c.id = m.course_id
      WHERE m.id = module_id
    )
  );

-- ==================== POLÍTICAS PARA TABELA INSCRIÇÕES ====================

-- Os usuários só podem ver suas próprias inscrições
CREATE POLICY "Usuários veem suas próprias inscrições" ON public.enrollments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Instrutores podem ver inscrições nos seus cursos
CREATE POLICY "Instrutores veem inscrições nos seus cursos" ON public.enrollments
  FOR SELECT TO authenticated
  USING (
    auth.uid() IN (
      SELECT instructor_id FROM public.courses WHERE id = course_id
    )
  );

-- Usuários só podem se inscrever em cursos (para si mesmos)
CREATE POLICY "Usuários se inscrevem em cursos" ON public.enrollments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar suas próprias inscrições
CREATE POLICY "Usuários atualizam suas próprias inscrições" ON public.enrollments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem cancelar suas próprias inscrições
CREATE POLICY "Usuários cancelam suas próprias inscrições" ON public.enrollments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ==================== POLÍTICAS PARA TABELA PERFIS ====================

-- Perfis são visíveis para todos
CREATE POLICY "Perfis visíveis para todos" ON public.profiles
  FOR SELECT USING (true);

-- Usuários só podem atualizar seu próprio perfil
CREATE POLICY "Usuários atualizam seu próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==================== PERMISSÕES DE ARMAZENAMENTO ====================

-- Nota: As políticas de armazenamento (Storage) precisam ser configuradas 
-- diretamente no console do Supabase, pois não podem ser definidas via SQL.
-- Recomendações:
-- 1. Bucket 'course-images': 
--    - Permitir leitura pública (anon)
--    - Escrita apenas para usuários autenticados
--    - Apenas o proprietário pode atualizar/excluir suas próprias imagens
-- 
-- 2. Bucket 'course-videos':
--    - Permitir leitura pública (anon) ou restringir à alunos inscritos
--    - Escrita apenas para usuários autenticados
--    - Apenas o proprietário pode atualizar/excluir seus próprios vídeos
--
-- 3. Bucket 'course-documents':
--    - Permitir leitura pública (anon) ou restringir à alunos inscritos
--    - Escrita apenas para usuários autenticados
--    - Apenas o proprietário pode atualizar/excluir seus próprios documentos 