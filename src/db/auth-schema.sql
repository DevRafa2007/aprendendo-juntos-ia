
-- Esquema para o sistema de autenticação
-- Este arquivo contém as tabelas e configurações necessárias para o sistema de autenticação

-- Ativar extensões necessárias se ainda não estiverem ativadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela para armazenar informações adicionais de sessão
DO $$
BEGIN
  -- Verificar se a tabela auth_session_metadata existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_session_metadata') THEN
    -- Criar tabela auth_session_metadata se não existir
    CREATE TABLE public.auth_session_metadata (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID NOT NULL REFERENCES auth.sessions(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      device_info JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END
$$;

-- Função para criar perfil de usuário automaticamente quando um novo usuário é registrado
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para adicionar perfil quando um usuário é criado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.create_profile_for_user();
  END IF;
END
$$;

-- Função para atualizar perfil quando usuário é atualizado
CREATE OR REPLACE FUNCTION public.update_profile_on_user_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.email <> NEW.email OR OLD.raw_user_meta_data <> NEW.raw_user_meta_data THEN
    UPDATE public.profiles
    SET 
      email = NEW.email,
      name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar perfil quando um usuário é atualizado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_updated') THEN
    CREATE TRIGGER on_auth_user_updated
      AFTER UPDATE ON auth.users
      FOR EACH ROW
      WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
      EXECUTE FUNCTION public.update_profile_on_user_update();
  END IF;
END
$$;

-- Função para atualizar timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp na tabela auth_session_metadata
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_session_metadata') 
  AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_auth_session_metadata_updated_at') THEN
    CREATE TRIGGER update_auth_session_metadata_updated_at
    BEFORE UPDATE ON public.auth_session_metadata
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Políticas de Row Level Security para auth_session_metadata
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_session_metadata') THEN
    ALTER TABLE public.auth_session_metadata ENABLE ROW LEVEL SECURITY;
    
    -- Dropar políticas existentes se houver
    DROP POLICY IF EXISTS "Usuários veem suas próprias sessões" ON public.auth_session_metadata;
    DROP POLICY IF EXISTS "Usuários atualizam suas próprias sessões" ON public.auth_session_metadata;
    
    -- Criar novas políticas
    CREATE POLICY "Usuários veem suas próprias sessões" 
      ON public.auth_session_metadata FOR SELECT 
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Usuários atualizam suas próprias sessões" 
      ON public.auth_session_metadata FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Função para registrar sessão quando o usuário faz login
CREATE OR REPLACE FUNCTION public.register_session_metadata()
RETURNS TRIGGER AS $$
DECLARE
  request_data JSONB;
BEGIN
  -- Tentar capturar informações da requisição, se disponível
  request_data := current_setting('request.jwt.claims', true)::jsonb;
  
  INSERT INTO public.auth_session_metadata (
    session_id, 
    user_id, 
    device_info,
    ip_address,
    user_agent
  ) VALUES (
    NEW.id,
    NEW.user_id,
    jsonb_build_object(
      'client_info', request_data->'client_info',
      'platform', request_data->'platform'
    ),
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
    current_setting('request.headers', true)::jsonb->>'user-agent'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar metadados de sessão
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_session_created') THEN
    CREATE TRIGGER on_auth_session_created
      AFTER INSERT ON auth.sessions
      FOR EACH ROW
      EXECUTE FUNCTION public.register_session_metadata();
  END IF;
END
$$;

-- Índices para melhorar performance
DO $$
BEGIN
  -- Índices para auth_session_metadata
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_session_metadata')
  AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_auth_session_metadata_user_id') THEN
    CREATE INDEX idx_auth_session_metadata_user_id ON public.auth_session_metadata(user_id);
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_session_metadata')
  AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_auth_session_metadata_session_id') THEN
    CREATE INDEX idx_auth_session_metadata_session_id ON public.auth_session_metadata(session_id);
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_session_metadata')
  AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_auth_session_metadata_last_active') THEN
    CREATE INDEX idx_auth_session_metadata_last_active ON public.auth_session_metadata(last_active);
  END IF;
END
$$;
