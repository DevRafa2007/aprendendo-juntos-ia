
-- Políticas RLS para o sistema de autenticação
-- Este arquivo contém as políticas de segurança para acesso às tabelas relacionadas à autenticação

-- Ativar RLS nas tabelas
ALTER TABLE public.auth_session_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==================== POLÍTICAS PARA TABELA AUTH_SESSION_METADATA ====================

-- Usuários podem ver apenas suas próprias sessões
CREATE POLICY "Usuários veem suas próprias sessões" ON public.auth_session_metadata
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Usuários só podem atualizar suas próprias sessões
CREATE POLICY "Usuários atualizam suas próprias sessões" ON public.auth_session_metadata
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Somente serviço pode inserir novas sessões (via trigger)
CREATE POLICY "Serviço pode inserir sessões" ON public.auth_session_metadata
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Somente serviço pode excluir sessões
CREATE POLICY "Serviço pode excluir sessões" ON public.auth_session_metadata
  FOR DELETE TO service_role
  USING (true);

-- ==================== POLÍTICAS PARA TABELA PROFILES ====================

-- Perfis são visíveis para todos (informações básicas como nome e avatar)
CREATE POLICY "Perfis visíveis para todos" ON public.profiles
  FOR SELECT USING (true);

-- Usuários só podem atualizar seu próprio perfil
CREATE POLICY "Usuários atualizam seu próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Serviço pode inserir novos perfis (via trigger)
CREATE POLICY "Serviço pode criar perfis" ON public.profiles
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Políticas para garantir que apenas usuários autenticados possam interagir com o sistema
CREATE POLICY "Autenticação requerida para operações" ON public.profiles
  FOR ALL TO authenticated
  USING (true);
