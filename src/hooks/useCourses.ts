import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { deleteMediaByUrl } from '@/services/mediaService';

export interface CourseType {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  instructor_id: string;
  category: string | null;
  subject: string | null;
  duration: number | null;
  level: string | null;
  created_at: string;
  updated_at: string;
}

export type CourseFormData = {
  title: string;
  description: string;
  image_url: string | null;
  price: number;
  category: string;
  subject: string | null;
  duration: number;
  level: string;
};

export interface CourseFilters {
  category?: string;
  subject?: string;
  level?: string | string[];
  minDuration?: number;
  maxDuration?: number;
  minPrice?: number;
  maxPrice?: number;
  instructorId?: string;
  searchQuery?: string;
}

export function useCourses() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Busca cursos com filtros avançados
   */
  const fetchCourses = async (filters?: CourseFilters) => {
    try {
      setIsLoading(true);
      let query = supabase.from('courses').select('*');
      
      // Aplicar filtros se fornecidos
      if (filters) {
        // Filtro por categoria
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        // Filtro por matéria
        if (filters.subject) {
          query = query.eq('subject', filters.subject);
        }
        
        // Filtro por nível
        if (filters.level) {
          if (Array.isArray(filters.level)) {
            query = query.in('level', filters.level);
          } else {
            query = query.eq('level', filters.level);
          }
        }
        
        // Filtro por duração (min e max)
        if (filters.minDuration !== undefined) {
          query = query.gte('duration', filters.minDuration);
        }
        if (filters.maxDuration !== undefined) {
          query = query.lte('duration', filters.maxDuration);
        }
        
        // Filtro por preço (min e max)
        if (filters.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice);
        }
        
        // Filtro por instrutor
        if (filters.instructorId) {
          query = query.eq('instructor_id', filters.instructorId);
        }
        
        // Busca textual (no título e descrição)
        if (filters.searchQuery) {
          query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
        }
      }
      
      // Ordenação padrão por data de criação (decrescente)
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar cursos:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoursesByInstructor = async (instructorId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar cursos do instrutor:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseById = async (courseId: string) => {
    try {
      console.log(`Buscando curso com ID: ${courseId}`);
      setIsLoading(true);
      
      if (!courseId || courseId === 'undefined' || courseId === 'null') {
        console.error('ID do curso inválido:', courseId);
        return { data: null, error: new Error('ID do curso inválido') };
      }
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error(`Erro ao buscar curso (${courseId}):`, error);
        
        // Se o erro for "not found", retornamos null em vez de lançar erro
        if (error.code === 'PGRST116') {
          console.log('Curso não encontrado no banco de dados');
          return { data: null, error: null };
        }
        
        throw error;
      }

      console.log('Curso encontrado:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Exceção ao buscar curso:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const createCourse = async (courseData: CourseFormData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para criar um curso"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          instructor_id: user.id
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar curso",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Curso criado",
        description: "Seu curso foi criado com sucesso!"
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar curso:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (courseId: string, courseData: Partial<CourseFormData>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para atualizar um curso"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...courseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .eq('instructor_id', user.id) // Garante que apenas o instrutor possa atualizar o curso
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar curso",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Curso atualizado",
        description: "Seu curso foi atualizado com sucesso!"
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar curso:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deleta um curso e seus recursos relacionados
   */
  const deleteCourse = async (courseId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para deletar um curso"
      });
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Primeiro, obtém o curso para acessar sua imagem (se existir)
      const { data: course } = await supabase
        .from('courses')
        .select('image_url')
        .eq('id', courseId)
        .eq('instructor_id', user.id) // Garante que apenas o instrutor possa deletar o curso
        .single();
      
      // Se houver uma imagem associada, tenta deletá-la
      if (course?.image_url) {
        await deleteMediaByUrl(course.image_url);
      }
      
      // Finalmente, deleta o curso
      // Nota: Os módulos e aulas serão deletados em cascata devido à configuração da foreign key
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)
        .eq('instructor_id', user.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao deletar curso",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Curso deletado",
        description: "Seu curso foi deletado com sucesso!"
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao deletar curso:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Conta o número total de cursos (opcionalmente filtrados)
   */
  const countCourses = async (filters?: CourseFilters) => {
    try {
      setIsLoading(true);
      let query = supabase.from('courses').select('id', { count: 'exact', head: true });
      
      // Aplicar os mesmos filtros da função fetchCourses
      if (filters) {
        if (filters.category) query = query.eq('category', filters.category);
        if (filters.subject) query = query.eq('subject', filters.subject);
        
        if (filters.level) {
          if (Array.isArray(filters.level)) {
            query = query.in('level', filters.level);
          } else {
            query = query.eq('level', filters.level);
          }
        }
        
        if (filters.minDuration !== undefined) query = query.gte('duration', filters.minDuration);
        if (filters.maxDuration !== undefined) query = query.lte('duration', filters.maxDuration);
        if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
        if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
        if (filters.instructorId) query = query.eq('instructor_id', filters.instructorId);
        
        if (filters.searchQuery) {
          query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
        }
      }
      
      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return { count, error: null };
    } catch (error: any) {
      console.error('Erro ao contar cursos:', error);
      return { count: 0, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isLoading, 
    fetchCourses, 
    fetchCoursesByInstructor, 
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    countCourses
  };
}
