
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CourseType {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  instructor_id: string;
  category: string | null;
  duration: number | null;
  level: string | null;
  created_at: string;
  updated_at: string;
}

export type CourseFormData = Omit<CourseType, 'id' | 'instructor_id' | 'created_at' | 'updated_at'>;

export function useCourses() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCourses = async (category?: string) => {
    try {
      setIsLoading(true);
      let query = supabase.from('courses').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
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
      setIsLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar curso:', error);
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
        .update(courseData)
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

  return { 
    isLoading, 
    fetchCourses, 
    fetchCoursesByInstructor, 
    fetchCourseById,
    createCourse,
    updateCourse
  };
}
