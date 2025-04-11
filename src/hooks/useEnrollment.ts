import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface EnrollmentType {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed: boolean;
  progress: number;
}

export function useEnrollment() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Inscreve o usuário em um curso
   */
  const enrollInCourse = async (courseId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para se inscrever em um curso"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Verifica se o usuário já está inscrito
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // Se já estiver inscrito, retorna a inscrição existente
      if (existingEnrollment) {
        toast({
          title: "Já inscrito",
          description: "Você já está inscrito neste curso!"
        });
        return { data: existingEnrollment, error: null, alreadyEnrolled: true };
      }
      
      // Cria a nova inscrição
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          completed: false,
          progress: 0
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao se inscrever",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Inscrição realizada",
        description: "Você foi inscrito no curso com sucesso!"
      });
      
      return { data, error: null, alreadyEnrolled: false };
    } catch (error: any) {
      console.error('Erro ao se inscrever no curso:', error);
      return { data: null, error, alreadyEnrolled: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancela a inscrição do usuário em um curso
   */
  const cancelEnrollment = async (courseId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para cancelar sua inscrição"
      });
      return { success: false, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao cancelar inscrição",
          description: error.message
        });
        throw error;
      }

      toast({
        title: "Inscrição cancelada",
        description: "Sua inscrição no curso foi cancelada com sucesso"
      });
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao cancelar inscrição:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verifica se o usuário está inscrito em um curso
   */
  const checkEnrollment = async (courseId: string) => {
    if (!user) {
      return { isEnrolled: false, enrollmentData: null, error: null };
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { 
        isEnrolled: !!data, 
        enrollmentData: data, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao verificar inscrição:', error);
      return { isEnrolled: false, enrollmentData: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca todos os cursos em que o usuário está inscrito
   */
  const fetchUserEnrollments = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para ver seus cursos"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Busca as inscrições e informações do curso relacionado
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses:course_id (
            id,
            title,
            description,
            image_url,
            category,
            subject,
            level,
            duration,
            instructor_id
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao buscar cursos inscritos:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza o progresso do usuário em um curso
   */
  const updateProgress = async (courseId: string, progress: number, completed: boolean = false) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para atualizar seu progresso"
      });
      return { data: null, error: new Error('Usuário não autenticado') };
    }

    try {
      setIsLoading(true);
      
      // Verifica se o usuário está inscrito
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      if (!enrollment) {
        throw new Error('Você não está inscrito neste curso');
      }
      
      // Atualiza o progresso
      const { data, error } = await supabase
        .from('enrollments')
        .update({
          progress,
          completed
        })
        .eq('id', enrollment.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Notifica apenas se o curso for completado
      if (completed) {
        toast({
          title: "Curso completado!",
          description: "Parabéns! Você completou este curso."
        });
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar progresso:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Retorna estatísticas sobre as inscrições do usuário
   */
  const getUserStats = async () => {
    if (!user) {
      return { 
        stats: { 
          totalEnrollments: 0, 
          completedCourses: 0,
          inProgressCourses: 0,
          averageProgress: 0
        }, 
        error: null 
      };
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Calcula as estatísticas
      const totalEnrollments = data.length;
      const completedCourses = data.filter(e => e.completed).length;
      const inProgressCourses = totalEnrollments - completedCourses;
      
      // Calcular progresso médio de todos os cursos
      const totalProgress = data.reduce((sum, enrollment) => sum + enrollment.progress, 0);
      const averageProgress = totalEnrollments > 0 
        ? Math.round((totalProgress / totalEnrollments) * 100) / 100 
        : 0;

      return { 
        stats: {
          totalEnrollments,
          completedCourses,
          inProgressCourses,
          averageProgress
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      return { 
        stats: { 
          totalEnrollments: 0, 
          completedCourses: 0,
          inProgressCourses: 0,
          averageProgress: 0
        }, 
        error 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    enrollInCourse,
    cancelEnrollment,
    checkEnrollment,
    fetchUserEnrollments,
    updateProgress,
    getUserStats
  };
} 