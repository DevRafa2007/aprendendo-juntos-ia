import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ModuleType {
  id: string;
  course_id: string;
  title: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface LessonType {
  id: string;
  module_id: string;
  title: string;
  content_type: 'video' | 'text' | 'quiz';
  content_data: any;
  order: number;
  created_at: string;
  updated_at: string;
}

export type ModuleFormData = {
  title: string;
  order?: number;
};

export type LessonFormData = {
  title: string;
  content_type: 'video' | 'text' | 'quiz';
  content_data?: any;
  order?: number;
};

export function useCourseContent() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Busca todos os módulos de um curso
   */
  const fetchModules = async (courseId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar módulos:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca todas as aulas de um módulo
   */
  const fetchLessons = async (moduleId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar aulas:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca toda a estrutura de conteúdo de um curso (módulos e aulas)
   */
  const fetchCourseContent = async (courseId: string) => {
    try {
      setIsLoading(true);
      
      // Busca os módulos do curso
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (modulesError) throw modulesError;
      
      // Para cada módulo, busca suas aulas
      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order', { ascending: true });
          
          if (lessonsError) throw lessonsError;
          
          return {
            ...module,
            lessons: lessons
          };
        })
      );

      return { data: modulesWithLessons, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar estrutura do curso:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cria um novo módulo em um curso
   */
  const createModule = async (courseId: string, moduleData: ModuleFormData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para criar um módulo"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Se order não for fornecido, pega o próximo número da ordem
      if (moduleData.order === undefined) {
        const { data: modules } = await supabase
          .from('modules')
          .select('order')
          .eq('course_id', courseId)
          .order('order', { ascending: false })
          .limit(1);
        
        const nextOrder = modules && modules.length > 0 ? modules[0].order + 1 : 0;
        moduleData.order = nextOrder;
      }
      
      const { data, error } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          title: moduleData.title,
          order: moduleData.order
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar módulo",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Módulo criado",
        description: "O módulo foi criado com sucesso!"
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar módulo:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza um módulo existente
   */
  const updateModule = async (moduleId: string, moduleData: Partial<ModuleFormData>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para atualizar um módulo"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .update({
          ...moduleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId)
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar módulo",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Módulo atualizado",
        description: "O módulo foi atualizado com sucesso!"
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar módulo:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deleta um módulo
   */
  const deleteModule = async (moduleId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para deletar um módulo"
      });
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao deletar módulo",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Módulo deletado",
        description: "O módulo foi deletado com sucesso!"
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao deletar módulo:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cria uma nova aula em um módulo
   */
  const createLesson = async (moduleId: string, lessonData: LessonFormData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para criar uma aula"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Se order não for fornecido, pega o próximo número da ordem
      if (lessonData.order === undefined) {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('order')
          .eq('module_id', moduleId)
          .order('order', { ascending: false })
          .limit(1);
        
        const nextOrder = lessons && lessons.length > 0 ? lessons[0].order + 1 : 0;
        lessonData.order = nextOrder;
      }
      
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          module_id: moduleId,
          title: lessonData.title,
          content_type: lessonData.content_type,
          content_data: lessonData.content_data || {},
          order: lessonData.order
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar aula",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Aula criada",
        description: "A aula foi criada com sucesso!"
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar aula:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza uma aula existente
   */
  const updateLesson = async (lessonId: string, lessonData: Partial<LessonFormData>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para atualizar uma aula"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .update({
          ...lessonData,
          updated_at: new Date().toISOString()
        })
        .eq('id', lessonId)
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar aula",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Aula atualizada",
        description: "A aula foi atualizada com sucesso!"
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar aula:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deleta uma aula
   */
  const deleteLesson = async (lessonId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para deletar uma aula"
      });
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao deletar aula",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Aula deletada",
        description: "A aula foi deletada com sucesso!"
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao deletar aula:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reordena os módulos de um curso
   */
  const reorderModules = async (courseId: string, moduleIds: string[]) => {
    try {
      setIsLoading(true);
      
      const updates = moduleIds.map((id, index) => ({
        id,
        order: index,
        updated_at: new Date().toISOString()
      }));
      
      const { error } = await supabase
        .from('modules')
        .upsert(updates);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao reordenar módulos",
          description: error.message
        });
        throw error;
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao reordenar módulos:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Reordena as aulas de um módulo
   */
  const reorderLessons = async (moduleId: string, lessonIds: string[]) => {
    try {
      setIsLoading(true);
      
      const updates = lessonIds.map((id, index) => ({
        id,
        order: index,
        updated_at: new Date().toISOString()
      }));
      
      const { error } = await supabase
        .from('lessons')
        .upsert(updates);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao reordenar aulas",
          description: error.message
        });
        throw error;
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao reordenar aulas:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchModules,
    fetchLessons,
    fetchCourseContent,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderModules,
    reorderLessons
  };
} 