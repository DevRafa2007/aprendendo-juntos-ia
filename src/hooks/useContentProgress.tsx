import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@chakra-ui/react';

// Interface para os tipos de progresso
export interface ContentProgressEntry {
  content_id: string;
  module_id: string;
  course_id: string;
  progress_percentage: number;
  completed: boolean;
  last_position?: number;
  time_spent_seconds: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseProgressSummary {
  course_id: string;
  total_content: number;
  completed_content: number;
  overall_progress: number;
  last_accessed?: string;
}

interface ContentProgressItem {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  content_id: string;
  status: 'started' | 'completed' | 'in_progress';
  progress_percentage: number;
  last_position?: number;
  updated_at: string;
  created_at: string;
}

interface QuizProgress {
  id: string;
  user_id: string;
  quiz_id: string;
  course_id: string;
  content_id: string;
  score: number;
  max_score: number;
  correct_answers: number;
  total_questions: number;
  completed: boolean;
  attempts: number;
  last_attempt_at: string;
  created_at: string;
  updated_at: string;
}

interface ProgressResponse {
  success: boolean;
  data?: ContentProgressItem[] | ContentProgressItem | QuizProgress | null;
  error?: string;
}

// Tipos específicos para cada tipo de conteúdo
interface VideoProgress {
  content_id: string;
  progress_percentage: number;
  last_position: number;
  duration: number;
  status: 'started' | 'completed' | 'in_progress';
}

// Hook para gerenciar o progresso do conteúdo
export function useContentProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const toast = useToast();
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  // Função para obter o token de autenticação
  const getAuthToken = useCallback(() => {
    return user?.token || '';
  }, [user]);

  // Registrar ou atualizar progresso de um conteúdo
  const updateContentProgress = async (contentId: string, moduleId: string, courseId: string, progressData: {
    progress_percentage: number;
    completed?: boolean;
    last_position?: number;
    time_spent_seconds?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      
      const response = await axios.post(`${apiUrl}/progress/content`, {
        content_id: contentId,
        module_id: moduleId,
        course_id: courseId,
        ...progressData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar progresso';
      setError(errorMessage);
      
      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Marcar um conteúdo como concluído
  const markContentAsCompleted = async (contentId: string, moduleId: string, courseId: string) => {
    return updateContentProgress(contentId, moduleId, courseId, {
      progress_percentage: 100,
      completed: true,
      time_spent_seconds: 0 // Pode ser passado o tempo real se disponível
    });
  };
  
  // Obter o progresso de um conteúdo específico
  const getContentProgress = useCallback(
    async (contentId: string): Promise<ProgressResponse> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Usuário não autenticado');
        }

        const response = await axios.get(`${apiUrl}/progress/content/${contentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setLoading(false);
        return {
          success: true,
          data: response.data,
        };
      } catch (err) {
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar progresso do conteúdo';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [getAuthToken]
  );
  
  // Obter o progresso de todos os conteúdos de um módulo
  const getModuleContentProgress = async (moduleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      
      const response = await axios.get(`${apiUrl}/progress/module/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar progresso do módulo';
      setError(errorMessage);
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Obter um resumo do progresso de um curso
  const getCourseContentProgress = async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      
      const response = await axios.get(`${apiUrl}/progress/course/${courseId}/summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, data: response.data, error: null };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar resumo do progresso do curso';
      setError(errorMessage);
      
      return { success: false, data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // Registrar posição do vídeo
  const updateVideoPosition = async (contentId: string, moduleId: string, courseId: string, position: number, duration: number) => {
    // Calcular a porcentagem de progresso baseada na posição atual do vídeo
    const progress = Math.min(Math.round((position / duration) * 100), 100);
    const completed = progress >= 95; // Considerar como concluído se assistiu mais de 95%
    
    return updateContentProgress(contentId, moduleId, courseId, {
      progress_percentage: progress,
      completed,
      last_position: position,
      time_spent_seconds: position // Tempo assistido em segundos
    });
  };
  
  // Registrar conclusão de conteúdo de texto/leitura
  const markReadingContentAsViewed = async (contentId: string, moduleId: string, courseId: string) => {
    return updateContentProgress(contentId, moduleId, courseId, {
      progress_percentage: 100,
      completed: true,
      time_spent_seconds: 0
    });
  };
  
  // Registrar download de um documento
  const registerDocumentDownload = async (contentId: string, moduleId: string, courseId: string) => {
    return updateContentProgress(contentId, moduleId, courseId, {
      progress_percentage: 50, // Consideramos 50% ao baixar
      completed: false,
      time_spent_seconds: 0
    });
  };
  
  // Marcar documento como lido/concluído
  const markDocumentAsCompleted = async (contentId: string, moduleId: string, courseId: string) => {
    return updateContentProgress(contentId, moduleId, courseId, {
      progress_percentage: 100,
      completed: true,
      time_spent_seconds: 0
    });
  };
  
  // Registrar progresso em um quiz
  const updateQuizProgress = async (
    contentId: string, 
    moduleId: string, 
    courseId: string, 
    score: number, 
    totalQuestions: number
  ) => {
    const progressPercentage = Math.round((score / totalQuestions) * 100);
    const completed = score > 0; // Consideramos completo se acertou pelo menos uma questão
    
    return updateContentProgress(contentId, moduleId, courseId, {
      progress_percentage: progressPercentage,
      completed,
      time_spent_seconds: 0 // Pode ser passado o tempo real se disponível
    });
  };
  
  // Obter o progresso de todos os cursos do usuário
  const getAllUserProgress = useCallback(async (): Promise<ProgressResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await axios.get(`${apiUrl}/progress/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLoading(false);
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar progresso do usuário';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [getAuthToken]);

  // Atualizar o progresso de um vídeo
  const updateVideoProgress = useCallback(
    async (
      courseId: string,
      moduleId: string,
      contentId: string,
      progress: VideoProgress
    ): Promise<ProgressResponse> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Usuário não autenticado');
        }

        const response = await axios.post(
          `${apiUrl}/progress/video`,
          {
            course_id: courseId,
            module_id: moduleId,
            content_id: contentId,
            progress_percentage: progress.progress_percentage,
            last_position: progress.last_position,
            duration: progress.duration,
            status: progress.status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLoading(false);
        toast({
          title: 'Progresso atualizado',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'bottom-right',
        });
        
        return {
          success: true,
          data: response.data,
        };
      } catch (err) {
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar progresso do vídeo';
        setError(errorMessage);
        
        toast({
          title: 'Erro ao atualizar progresso',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [getAuthToken, toast]
  );

  // Buscar o progresso de todos os conteúdos de um curso
  const getCourseProgress = useCallback(
    async (courseId: string): Promise<ProgressResponse> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Usuário não autenticado');
        }

        const response = await axios.get(
          `${apiUrl}/progress/course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLoading(false);
        return {
          success: true,
          data: response.data,
        };
      } catch (err) {
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar progresso do curso';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [getAuthToken]
  );

  // Buscar o progresso de todos os conteúdos de um módulo específico
  const getModuleProgress = useCallback(
    async (courseId: string, moduleId: string): Promise<ProgressResponse> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Usuário não autenticado');
        }

        const response = await axios.get(
          `${apiUrl}/progress/module/${moduleId}?course_id=${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLoading(false);
        return {
          success: true,
          data: response.data,
        };
      } catch (err) {
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar progresso do módulo';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [getAuthToken]
  );

  // Submeter resultados de um quiz
  const submitQuizResults = useCallback(
    async (
      courseId: string,
      contentId: string,
      quizId: string,
      score: number,
      maxScore: number,
      correctAnswers: number,
      totalQuestions: number
    ): Promise<ProgressResponse> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Usuário não autenticado');
        }

        const response = await axios.post(
          `${apiUrl}/progress/quiz`,
          {
            course_id: courseId,
            content_id: contentId,
            quiz_id: quizId,
            score,
            max_score: maxScore,
            correct_answers: correctAnswers,
            total_questions: totalQuestions,
            completed: true,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLoading(false);
        toast({
          title: 'Quiz salvo com sucesso',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'bottom-right',
        });
        
        return {
          success: true,
          data: response.data,
        };
      } catch (err) {
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao submeter resultados do quiz';
        setError(errorMessage);
        
        toast({
          title: 'Erro ao salvar resultados do quiz',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [getAuthToken, toast]
  );

  // Obter os resultados de um quiz específico
  const getQuizResults = useCallback(
    async (quizId: string): Promise<ProgressResponse> => {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Usuário não autenticado');
        }

        const response = await axios.get(
          `${apiUrl}/progress/quiz/${quizId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLoading(false);
        return {
          success: true,
          data: response.data,
        };
      } catch (err) {
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar resultados do quiz';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [getAuthToken]
  );

  return {
    loading,
    error,
    updateContentProgress,
    markContentAsCompleted,
    getContentProgress,
    getModuleContentProgress,
    getCourseContentProgress,
    updateVideoPosition,
    markReadingContentAsViewed,
    registerDocumentDownload,
    markDocumentAsCompleted,
    updateQuizProgress,
    getAllUserProgress,
    updateVideoProgress,
    getCourseProgress,
    getModuleProgress,
    submitQuizResults,
    getQuizResults,
  };
} 