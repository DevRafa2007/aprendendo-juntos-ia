-- Schema modificado para o banco de dados do Supabase
-- Esta versão evita criar tabelas que já existem no update-schema.sql

-- Alterações nas tabelas de perfis
DO $$
BEGIN
  -- Verificar se a tabela profiles existe e adicionar campos que podem estar faltando
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Verificar e adicionar coluna social_links se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'social_links') THEN
      ALTER TABLE public.profiles ADD COLUMN social_links JSONB;
    END IF;
  ELSE
    -- Criar tabela profiles se não existir
    CREATE TABLE public.profiles (
      id UUID REFERENCES auth.users PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      website TEXT,
      social_links JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
  END IF;
END
$$;

-- Alterações nas tabelas de cursos
DO $$
BEGIN
  -- Verificar se a tabela courses existe e adicionar campos que podem estar faltando
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    -- Verificar e adicionar coluna slug se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'slug') THEN
      ALTER TABLE public.courses ADD COLUMN slug TEXT UNIQUE;
    END IF;
  ELSE
    -- Criar tabela courses se não existir
    CREATE TABLE public.courses (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      subject TEXT,
      duration INTEGER NOT NULL,
      level TEXT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      image_url TEXT,
      instructor_id UUID REFERENCES public.profiles(id) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      published BOOLEAN DEFAULT false NOT NULL,
      slug TEXT UNIQUE
    );
  END IF;
END
$$;

-- Alterações nas tabelas de módulos
DO $$
BEGIN
  -- Verificar se a tabela modules existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modules') THEN
    -- Criar tabela modules se não existir
    CREATE TABLE public.modules (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
  END IF;
END
$$;

-- Alterações nas tabelas de conteúdos
DO $$
BEGIN
  -- Verificar se a tabela contents existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contents') THEN
    -- Criar tabela contents se não existir
    CREATE TABLE public.contents (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
  END IF;
END
$$;

-- Alterações nas tabelas de conteúdo de vídeo
DO $$
BEGIN
  -- Verificar se a tabela content_videos existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_videos') THEN
    -- Criar tabela content_videos se não existir
    CREATE TABLE public.content_videos (
      content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE PRIMARY KEY,
      video_url TEXT,
      video_duration INTEGER, -- em segundos
      thumbnail_url TEXT,
      is_uploaded BOOLEAN DEFAULT false NOT NULL
    );
  END IF;
END
$$;

-- Alterações nas tabelas de conteúdo de texto
DO $$
BEGIN
  -- Verificar se a tabela content_texts existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_texts') THEN
    -- Criar tabela content_texts se não existir
    CREATE TABLE public.content_texts (
      content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE PRIMARY KEY,
      content TEXT NOT NULL -- conteúdo HTML
    );
  END IF;
END
$$;

-- Alterações nas tabelas de conteúdo de PDF
DO $$
BEGIN
  -- Verificar se a tabela content_pdfs existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_pdfs') THEN
    -- Criar tabela content_pdfs se não existir
    CREATE TABLE public.content_pdfs (
      content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE PRIMARY KEY,
      file_url TEXT,
      file_name TEXT NOT NULL,
      file_size INTEGER, -- em bytes
      is_uploaded BOOLEAN DEFAULT false NOT NULL
    );
  END IF;
END
$$;

-- Alterações nas tabelas de conteúdo de link
DO $$
BEGIN
  -- Verificar se a tabela content_links existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_links') THEN
    -- Criar tabela content_links se não existir
    CREATE TABLE public.content_links (
      content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE PRIMARY KEY,
      url TEXT NOT NULL,
      icon TEXT
    );
  END IF;
END
$$;

-- Alterações nas tabelas de conteúdo de tarefa/exercício
DO $$
BEGIN
  -- Verificar se a tabela content_assignments existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_assignments') THEN
    -- Criar tabela content_assignments se não existir
    CREATE TABLE public.content_assignments (
      content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE PRIMARY KEY,
      instructions TEXT NOT NULL,
      due_date TIMESTAMP WITH TIME ZONE,
      points INTEGER,
      file_attachments JSONB
    );
  END IF;
END
$$;

-- Alterações nas tabelas de conteúdo de quiz
DO $$
BEGIN
  -- Verificar se a tabela content_quizzes existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_quizzes') THEN
    -- Criar tabela content_quizzes se não existir
    CREATE TABLE public.content_quizzes (
      content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE PRIMARY KEY,
      pass_score INTEGER NOT NULL, -- porcentagem para passar
      time_limit INTEGER, -- em minutos
      shuffle_questions BOOLEAN DEFAULT false NOT NULL
    );
  END IF;
END
$$;

-- Alterações nas tabelas de perguntas de quiz
DO $$
BEGIN
  -- Verificar se a tabela quiz_questions existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_questions') THEN
    -- Criar tabela quiz_questions se não existir
    CREATE TABLE public.quiz_questions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      quiz_id UUID REFERENCES public.content_quizzes(content_id) ON DELETE CASCADE NOT NULL,
      text TEXT NOT NULL,
      type TEXT NOT NULL, -- 'single', 'multiple', 'text'
      points INTEGER NOT NULL DEFAULT 1,
      explanation TEXT,
      order_index INTEGER NOT NULL
    );
  END IF;
END
$$;

-- Alterações nas tabelas de opções de perguntas de quiz
DO $$
BEGIN
  -- Verificar se a tabela quiz_options existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_options') THEN
    -- Criar tabela quiz_options se não existir
    CREATE TABLE public.quiz_options (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
      text TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL DEFAULT false
    );
  END IF;
END
$$;

-- Alterações nas tabelas de matrículas
DO $$
BEGIN
  -- Verificar se a tabela enrollments existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments') THEN
    -- Criar tabela enrollments se não existir
    CREATE TABLE public.enrollments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      completed_at TIMESTAMP WITH TIME ZONE,
      progress INTEGER DEFAULT 0 NOT NULL, -- porcentagem de conclusão
      UNIQUE(course_id, user_id)
    );
  END IF;
END
$$;

-- Alterações nas tabelas de progresso do aluno
DO $$
BEGIN
  -- Verificar se a tabela student_progress existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_progress') THEN
    -- Criar tabela student_progress se não existir
    CREATE TABLE public.student_progress (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
      content_id UUID REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
      completed BOOLEAN DEFAULT false NOT NULL,
      completed_at TIMESTAMP WITH TIME ZONE,
      last_position INTEGER, -- para vídeos, posição em segundos
      UNIQUE(enrollment_id, content_id)
    );
  END IF;
END
$$;

-- Alterações nas tabelas de resultados de quiz
DO $$
BEGIN
  -- Verificar se a tabela quiz_results existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_results') THEN
    -- Criar tabela quiz_results se não existir
    CREATE TABLE public.quiz_results (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
      quiz_id UUID REFERENCES public.content_quizzes(content_id) ON DELETE CASCADE NOT NULL,
      score INTEGER NOT NULL, -- pontuação obtida
      max_score INTEGER NOT NULL, -- pontuação máxima possível
      passed BOOLEAN NOT NULL,
      started_at TIMESTAMP WITH TIME ZONE NOT NULL,
      completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
      time_spent INTEGER NOT NULL, -- em segundos
      UNIQUE(enrollment_id, quiz_id, completed_at)
    );
  END IF;
END
$$;

-- Alterações nas tabelas de respostas de quiz
DO $$
BEGIN
  -- Verificar se a tabela quiz_answers existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_answers') THEN
    -- Criar tabela quiz_answers se não existir
    CREATE TABLE public.quiz_answers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      result_id UUID REFERENCES public.quiz_results(id) ON DELETE CASCADE NOT NULL,
      question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
      selected_options JSONB, -- para perguntas de escolha
      text_answer TEXT, -- para perguntas de texto
      is_correct BOOLEAN NOT NULL,
      points_earned INTEGER NOT NULL,
      UNIQUE(result_id, question_id)
    );
  END IF;
END
$$;

-- Alterações nas tabelas de avaliações de cursos
DO $$
BEGIN
  -- Verificar se a tabela course_reviews existe
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_reviews') THEN
    -- Criar tabela course_reviews se não existir
    CREATE TABLE public.course_reviews (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(course_id, user_id)
    );
  END IF;
END
$$;

-- Criar índices apenas se não existirem
DO $$
BEGIN
  -- Índices para courses
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_courses_instructor') THEN
    CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
  END IF;
  
  -- Índices para modules
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_modules_course') THEN
    CREATE INDEX idx_modules_course ON public.modules(course_id);
  END IF;
  
  -- Índices para contents
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contents_module') THEN
    CREATE INDEX idx_contents_module ON public.contents(module_id);
  END IF;
  
  -- Índices para enrollments
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_enrollments_course') THEN
    CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_enrollments_user') THEN
    CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
  END IF;
  
  -- Índices para student_progress
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_progress_enrollment') THEN
    CREATE INDEX idx_student_progress_enrollment ON public.student_progress(enrollment_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_student_progress_content') THEN
    CREATE INDEX idx_student_progress_content ON public.student_progress(content_id);
  END IF;
  
  -- Índices para quiz_questions
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_questions_quiz') THEN
    CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
  END IF;
  
  -- Índices para quiz_options
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_options_question') THEN
    CREATE INDEX idx_quiz_options_question ON public.quiz_options(question_id);
  END IF;
  
  -- Índices para quiz_results
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_results_enrollment') THEN
    CREATE INDEX idx_quiz_results_enrollment ON public.quiz_results(enrollment_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_results_quiz') THEN
    CREATE INDEX idx_quiz_results_quiz ON public.quiz_results(quiz_id);
  END IF;
  
  -- Índices para quiz_answers
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_answers_result') THEN
    CREATE INDEX idx_quiz_answers_result ON public.quiz_answers(result_id);
  END IF;
  
  -- Índices para course_reviews
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_reviews_course') THEN
    CREATE INDEX idx_course_reviews_course ON public.course_reviews(course_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_reviews_user') THEN
    CREATE INDEX idx_course_reviews_user ON public.course_reviews(user_id);
  END IF;
END
$$;

-- Configurar triggers para atualização automática da coluna updated_at (se ainda não existirem)
DO $$
BEGIN
  -- Para tabela profiles
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Para tabela courses
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at') THEN
    CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Para tabela modules
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_modules_updated_at') THEN
    CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON public.modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Para tabela contents
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_contents_updated_at') THEN
    CREATE TRIGGER update_contents_updated_at
    BEFORE UPDATE ON public.contents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Para tabela enrollments
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_enrollments_updated_at') THEN
    CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  -- Para tabela course_reviews
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_course_reviews_updated_at') THEN
    CREATE TRIGGER update_course_reviews_updated_at
    BEFORE UPDATE ON public.course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$; 