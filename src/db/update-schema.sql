-- Esse script apenas adiciona novos elementos ao esquema existente
-- Se alguma tabela ou coluna já existir, o script irá pular essas partes

-- Verifica e cria a tabela de uploads de mídia se não existir
CREATE TABLE IF NOT EXISTS public.media_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'document')),
    path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona políticas RLS para media_uploads se a tabela foi criada agora
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'media_uploads') 
    AND NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'media_uploads' AND policyname = 'Usuários podem ver suas próprias mídias') THEN
        ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Usuários podem ver suas próprias mídias" 
        ON public.media_uploads FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Usuários podem inserir suas próprias mídias" 
        ON public.media_uploads FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Usuários podem atualizar suas próprias mídias" 
        ON public.media_uploads FOR UPDATE 
        USING (auth.uid() = user_id) 
        WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Usuários podem excluir suas próprias mídias" 
        ON public.media_uploads FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Função para atualização automática da coluna updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adiciona gatilhos para atualizar timestamps nas tabelas existentes
DO $$
BEGIN
    -- Para tabela lessons
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lessons') 
    AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_lessons_updated_at') THEN
        CREATE TRIGGER update_lessons_updated_at
        BEFORE UPDATE ON public.lessons
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Para tabela modules
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modules') 
    AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_modules_updated_at') THEN
        CREATE TRIGGER update_modules_updated_at
        BEFORE UPDATE ON public.modules
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Para tabela courses
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') 
    AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_courses_updated_at') THEN
        CREATE TRIGGER update_courses_updated_at
        BEFORE UPDATE ON public.courses
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Para tabela enrollments
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments') 
    AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_enrollments_updated_at') THEN
        CREATE TRIGGER update_enrollments_updated_at
        BEFORE UPDATE ON public.enrollments
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    -- Para tabela profiles
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') 
    AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Criação de índices para melhorar performance
DO $$
BEGIN
    -- Índices para lessons
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lessons')
    AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lessons_module_id') THEN
        CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
    END IF;
    
    -- Índices para modules
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'modules')
    AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_modules_course_id') THEN
        CREATE INDEX idx_modules_course_id ON public.modules(course_id);
    END IF;
    
    -- Índices para courses
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses')
    AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_courses_instructor_id') THEN
        CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
    END IF;
    
    -- Índices para enrollments
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments')
    AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_enrollments_user_id') THEN
        CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments')
    AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_enrollments_course_id') THEN
        CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
    END IF;
END
$$; 