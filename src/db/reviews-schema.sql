-- Esquema para o sistema de avaliações e comentários
-- Este arquivo contém as tabelas necessárias para implementar o sistema de avaliações de cursos

-- Tabela para avaliações de cursos
DO $$
BEGIN
  -- Verificar se a tabela course_reviews existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_reviews') THEN
    -- Criar tabela course_reviews se não existir
    CREATE TABLE public.course_reviews (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      is_verified BOOLEAN DEFAULT false NOT NULL,
      is_featured BOOLEAN DEFAULT false NOT NULL,
      UNIQUE(course_id, user_id)
    );
  END IF;
END
$$;

-- Tabela para comentários em avaliações (respostas)
DO $$
BEGIN
  -- Verificar se a tabela review_comments existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'review_comments') THEN
    -- Criar tabela review_comments se não existir
    CREATE TABLE public.review_comments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      review_id UUID REFERENCES public.course_reviews(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      parent_id UUID REFERENCES public.review_comments(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      is_deleted BOOLEAN DEFAULT false NOT NULL
    );
  END IF;
END
$$;

-- Tabela para reações a avaliações (útil, não útil, etc.)
DO $$
BEGIN
  -- Verificar se a tabela review_reactions existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'review_reactions') THEN
    -- Criar tabela review_reactions se não existir
    CREATE TABLE public.review_reactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      review_id UUID REFERENCES public.course_reviews(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      reaction_type TEXT NOT NULL, -- 'helpful', 'unhelpful', etc.
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(review_id, user_id)
    );
  END IF;
END
$$;

-- Tabela para denúncias de avaliações e comentários
DO $$
BEGIN
  -- Verificar se a tabela review_reports existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'review_reports') THEN
    -- Criar tabela review_reports se não existir
    CREATE TABLE public.review_reports (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      review_id UUID REFERENCES public.course_reviews(id) ON DELETE CASCADE,
      comment_id UUID REFERENCES public.review_comments(id) ON DELETE CASCADE,
      reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'reviewed', 'actioned', 'dismissed'
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      resolved_at TIMESTAMP WITH TIME ZONE,
      resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      CHECK ((review_id IS NOT NULL AND comment_id IS NULL) OR (review_id IS NULL AND comment_id IS NOT NULL))
    );
  END IF;
END
$$;

-- Tabela para métricas agregadas de avaliações por curso
DO $$
BEGIN
  -- Verificar se a tabela course_review_metrics existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_review_metrics') THEN
    -- Criar tabela course_review_metrics se não existir
    CREATE TABLE public.course_review_metrics (
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE PRIMARY KEY,
      total_reviews INTEGER DEFAULT 0 NOT NULL,
      avg_rating DECIMAL(3, 2) DEFAULT 0.0 NOT NULL,
      rating_counts JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb NOT NULL,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
  END IF;
END
$$;

-- Criar índices para melhorar o desempenho das consultas
DO $$
BEGIN
  -- Índices para course_reviews
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_reviews_course_id') THEN
    CREATE INDEX idx_course_reviews_course_id ON public.course_reviews(course_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_reviews_user_id') THEN
    CREATE INDEX idx_course_reviews_user_id ON public.course_reviews(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_reviews_rating') THEN
    CREATE INDEX idx_course_reviews_rating ON public.course_reviews(rating);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_reviews_created_at') THEN
    CREATE INDEX idx_course_reviews_created_at ON public.course_reviews(created_at);
  END IF;
  
  -- Índices para review_comments
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_review_comments_review_id') THEN
    CREATE INDEX idx_review_comments_review_id ON public.review_comments(review_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_review_comments_user_id') THEN
    CREATE INDEX idx_review_comments_user_id ON public.review_comments(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_review_comments_parent_id') THEN
    CREATE INDEX idx_review_comments_parent_id ON public.review_comments(parent_id);
  END IF;
  
  -- Índices para review_reactions
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_review_reactions_review_id') THEN
    CREATE INDEX idx_review_reactions_review_id ON public.review_reactions(review_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_review_reactions_user_id') THEN
    CREATE INDEX idx_review_reactions_user_id ON public.review_reactions(user_id);
  END IF;
  
  -- Índices para review_reports
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_review_reports_review_id') THEN
    CREATE INDEX idx_review_reports_review_id ON public.review_reports(review_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_review_reports_comment_id') THEN
    CREATE INDEX idx_review_reports_comment_id ON public.review_reports(comment_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_review_reports_status') THEN
    CREATE INDEX idx_review_reports_status ON public.review_reports(status);
  END IF;
END
$$;

-- Adicionar triggers para atualizar os timestamps e métricas
DO $$
BEGIN
  -- Criar função para atualizar timestamps se não existir
  IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
  
  -- Criar função para atualizar métricas de avaliações
  CREATE OR REPLACE FUNCTION public.update_course_review_metrics()
  RETURNS TRIGGER AS $$
  DECLARE
    v_avg DECIMAL(3, 2);
    v_counts JSONB;
    v_count INTEGER;
  BEGIN
    -- Calcular novas estatísticas
    SELECT 
      COALESCE(AVG(rating), 0)::DECIMAL(3, 2),
      jsonb_build_object(
        '1', COUNT(*) FILTER (WHERE rating = 1),
        '2', COUNT(*) FILTER (WHERE rating = 2),
        '3', COUNT(*) FILTER (WHERE rating = 3),
        '4', COUNT(*) FILTER (WHERE rating = 4),
        '5', COUNT(*) FILTER (WHERE rating = 5)
      ),
      COUNT(*)
    INTO v_avg, v_counts, v_count
    FROM public.course_reviews
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id);
    
    -- Inserir ou atualizar métricas
    INSERT INTO public.course_review_metrics (
      course_id, total_reviews, avg_rating, rating_counts, last_updated
    ) VALUES (
      COALESCE(NEW.course_id, OLD.course_id), v_count, v_avg, v_counts, now()
    )
    ON CONFLICT (course_id) DO UPDATE SET
      total_reviews = v_count,
      avg_rating = v_avg,
      rating_counts = v_counts,
      last_updated = now();
    
    RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;
  
  -- Para tabela course_reviews - timestamps
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_course_reviews_updated_at') THEN
    CREATE TRIGGER update_course_reviews_updated_at
    BEFORE UPDATE ON public.course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Para tabela review_comments - timestamps
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_review_comments_updated_at') THEN
    CREATE TRIGGER update_review_comments_updated_at
    BEFORE UPDATE ON public.review_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Para tabela review_reports - timestamps
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_review_reports_updated_at') THEN
    CREATE TRIGGER update_review_reports_updated_at
    BEFORE UPDATE ON public.review_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Triggers para atualizar métricas
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_course_review_metrics_insert') THEN
    CREATE TRIGGER trigger_update_course_review_metrics_insert
    AFTER INSERT ON public.course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_course_review_metrics();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_course_review_metrics_update') THEN
    CREATE TRIGGER trigger_update_course_review_metrics_update
    AFTER UPDATE OF rating ON public.course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_course_review_metrics();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_course_review_metrics_delete') THEN
    CREATE TRIGGER trigger_update_course_review_metrics_delete
    AFTER DELETE ON public.course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_course_review_metrics();
  END IF;
END
$$; 