-- Esquema para o sistema de sincronização de progresso do aluno
-- Este arquivo contém as tabelas necessárias para sincronizar o progresso do aluno entre o frontend e o backend

-- Tabela para armazenar o progresso do aluno com sincronização
DO $$
BEGIN
  -- Verificar se a tabela student_progress_sync existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_progress_sync') THEN
    -- Criar tabela student_progress_sync se não existir
    CREATE TABLE public.student_progress_sync (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
      progress_percent INTEGER NOT NULL DEFAULT 0,
      completed BOOLEAN NOT NULL DEFAULT false,
      last_position JSONB, -- Para armazenar posição em vídeos, página em documentos, etc.
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      version INTEGER NOT NULL DEFAULT 1, -- Versionamento para resolução de conflitos
      client_timestamp BIGINT, -- Timestamp do cliente para resolução de conflitos offline
      UNIQUE(user_id, content_id)
    );
  END IF;
END
$$;

-- Tabela para rastrear interações detalhadas com o conteúdo
DO $$
BEGIN
  -- Verificar se a tabela content_interactions existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_interactions') THEN
    -- Criar tabela content_interactions se não existir
    CREATE TABLE public.content_interactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
      interaction_type TEXT NOT NULL, -- 'view', 'play', 'pause', 'complete', etc.
      interaction_data JSONB, -- Dados específicos da interação
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      client_timestamp BIGINT, -- Timestamp do cliente para ordenação correta
      synced BOOLEAN DEFAULT true NOT NULL
    );
  END IF;
END
$$;

-- Tabela para fila de sincronização offline
DO $$
BEGIN
  -- Verificar se a tabela sync_queue existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_queue') THEN
    -- Criar tabela sync_queue se não existir
    CREATE TABLE public.sync_queue (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      queue_type TEXT NOT NULL, -- 'progress', 'interaction', etc.
      payload JSONB NOT NULL, -- Dados a serem sincronizados
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
      error_message TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      processed_at TIMESTAMP WITH TIME ZONE
    );
  END IF;
END
$$;

-- Tabela para rastrear as sessões do usuário (para sincronização)
DO $$
BEGIN
  -- Verificar se a tabela user_sessions existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_sessions') THEN
    -- Criar tabela user_sessions se não existir
    CREATE TABLE public.user_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      device_info TEXT,
      last_activity TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      is_online BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
  END IF;
END
$$;

-- Criar índices para melhorar o desempenho das consultas
DO $$
BEGIN
  -- Índices para student_progress_sync
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_progress_sync_user') THEN
    CREATE INDEX idx_progress_sync_user ON public.student_progress_sync(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_progress_sync_content') THEN
    CREATE INDEX idx_progress_sync_content ON public.student_progress_sync(content_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_progress_sync_user_content') THEN
    CREATE INDEX idx_progress_sync_user_content ON public.student_progress_sync(user_id, content_id);
  END IF;
  
  -- Índices para content_interactions
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_interactions_user') THEN
    CREATE INDEX idx_content_interactions_user ON public.content_interactions(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_interactions_content') THEN
    CREATE INDEX idx_content_interactions_content ON public.content_interactions(content_id);
  END IF;
  
  -- Índices para sync_queue
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sync_queue_user') THEN
    CREATE INDEX idx_sync_queue_user ON public.sync_queue(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sync_queue_status') THEN
    CREATE INDEX idx_sync_queue_status ON public.sync_queue(status);
  END IF;
  
  -- Índices para user_sessions
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_user') THEN
    CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_sessions_is_online') THEN
    CREATE INDEX idx_user_sessions_is_online ON public.user_sessions(is_online);
  END IF;
END
$$;

-- Adicionar triggers para atualizar os timestamps
DO $$
BEGIN
  -- Criar função para atualizar timestamps se não existir
  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $BODY$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $BODY$ LANGUAGE plpgsql;
  END IF;
  
  -- Para tabela student_progress_sync
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_student_progress_sync_updated_at') THEN
    CREATE TRIGGER update_student_progress_sync_updated_at
    BEFORE UPDATE ON public.student_progress_sync
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Para tabela sync_queue
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sync_queue_updated_at') THEN
    CREATE TRIGGER update_sync_queue_updated_at
    BEFORE UPDATE ON public.sync_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Para tabela user_sessions
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_sessions_updated_at') THEN
    CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$; 