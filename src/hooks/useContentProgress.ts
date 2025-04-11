import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEnrollment } from './useEnrollment';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface ContentProgressType {
  id: number;
  enrollment_id: number;
  content_id: number;
  completed: boolean;
  completed_at: string | null;
  last_position: number | null; // Posição em segundos para vídeos
}

export type ProgressType = 'started' | 'in-progress' | 'completed';

interface ContentProgress {
  contentId: string;
  moduleId: string;
  progressStatus: ProgressType;
  lastAccessedAt: Date;
  timeSpent?: number; // Em segundos
  progress?: number; // 0-100
  currentPosition?: number; // Para vídeos, a posição atual em segundos
  lastPage?: number; // Para documentos, a última página visualizada
}

interface CourseProgress {
  courseId: string;
  userId: string;
  lastAccessedAt: Date;
  completedModules: string[];
  completedContents: string[];
  contentProgresses: ContentProgress[];
}

export interface UseContentProgressReturn {
  saveVideoProgress: (courseId: string, moduleId: string, contentId: string, currentTime: number, duration: number) => Promise<{success: boolean}>;
  markContentAsCompleted: (courseId: string, moduleId: string, contentId: string, extraData?: any) => Promise<{success: boolean}>;
  getContentProgress: (courseId: string, contentId: string) => Promise<ContentProgress | null>;
  getCourseProgress: (courseId: string) => Promise<CourseProgress | null>;
  getCompletionPercentage: (courseId: string) => Promise<number>;
  loading: boolean;
  error: string | null;
}

interface ContentProgressParams {
  courseId: string;
  moduleId: string;
  contentId: string;
}

interface ContentProgressData {
  position: number;
  completed: boolean;
  lastUpdated: string;
}

/**
 * Hook para gerenciar o progresso do usuário em um conteúdo específico
 */
export function useContentProgress({ courseId, moduleId, contentId }: ContentProgressParams) {
  const [position, setPosition] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { user } = useAuth();

  // Chave para armazenamento no localStorage
  const storageKey = `content-progress-${user?.uid || 'guest'}-${courseId}-${moduleId}-${contentId}`;

  // Carrega o progresso do localStorage
  useEffect(() => {
    if (!courseId || !moduleId || !contentId) {
      setIsLoading(false);
      return;
    }

    try {
      const savedProgress = localStorage.getItem(storageKey);
      
      if (savedProgress) {
        const progressData: ContentProgressData = JSON.parse(savedProgress);
        setPosition(progressData.position || 0);
        setCompleted(progressData.completed || false);
      }
    } catch (err) {
      console.error('Erro ao carregar progresso:', err);
      setError('Não foi possível carregar seu progresso anterior');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, moduleId, contentId, storageKey]);

  // Salva o progresso no localStorage e eventualmente no backend
  const saveProgress = async (currentPosition: number, isCompleted = false) => {
    if (!courseId || !moduleId || !contentId) return;
    
    try {
      // Atualiza o estado local
      setPosition(currentPosition);
      
      if (isCompleted) {
        setCompleted(true);
      }
      
      // Salva no localStorage
      const progressData: ContentProgressData = {
        position: currentPosition,
        completed: isCompleted || completed,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(progressData));
      
      // Aqui seria implementada a chamada para o backend para salvar o progresso
      // TODO: Implementar chamada de API para salvar o progresso no servidor
      
      return true;
    } catch (err) {
      console.error('Erro ao salvar progresso:', err);
      toast({
        title: 'Erro ao salvar progresso',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setError('Não foi possível salvar seu progresso');
      return false;
    }
  };

  // Marca o conteúdo como concluído
  const markAsCompleted = async () => {
    return saveProgress(position, true);
  };

  return {
    position,
    completed,
    isLoading,
    error,
    saveProgress,
    markAsCompleted,
  };
}

export const useContentProgress = (): UseContentProgressReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { user } = useAuth();
  const { checkEnrollment } = useEnrollment();

  /**
   * Obtém o documento de progresso do curso para o usuário atual
   */
  const getProgressDoc = async (courseId: string): Promise<CourseProgress | null> => {
    if (!user?.uid) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      const progressRef = doc(db, 'courseProgresses', `${user.uid}_${courseId}`);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        return progressDoc.data() as CourseProgress;
      } else {
        // Inicializa um novo documento de progresso se não existir
        const newProgressData: CourseProgress = {
          courseId,
          userId: user.uid,
          lastAccessedAt: new Date(),
          completedModules: [],
          completedContents: [],
          contentProgresses: []
        };

        await setDoc(progressRef, newProgressData);
        return newProgressData;
      }
    } catch (err) {
      console.error('Erro ao obter progresso:', err);
      setError('Erro ao carregar progresso do curso');
      return null;
    }
  };

  /**
   * Salva o progresso do vídeo
   */
  const saveVideoProgress = useCallback(async (
    courseId: string,
    moduleId: string,
    contentId: string,
    currentTime: number,
    duration: number
  ): Promise<{success: boolean}> => {
    if (!user?.uid) {
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const progressRef = doc(db, 'courseProgresses', `${user.uid}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      
      const progress = Math.round((currentTime / duration) * 100);
      const progressStatus: ProgressType = progress >= 90 ? 'completed' : progress > 0 ? 'in-progress' : 'started';
      
      const contentProgress: ContentProgress = {
        contentId,
        moduleId,
        progressStatus,
        lastAccessedAt: new Date(),
        timeSpent: currentTime,
        progress,
        currentPosition: currentTime
      };

      if (progressDoc.exists()) {
        const progressData = progressDoc.data() as CourseProgress;
        const existingContentIndex = progressData.contentProgresses.findIndex(
          p => p.contentId === contentId
        );

        let updatedContentProgresses = [...progressData.contentProgresses];
        
        if (existingContentIndex >= 0) {
          updatedContentProgresses[existingContentIndex] = contentProgress;
        } else {
          updatedContentProgresses.push(contentProgress);
        }

        // Atualizar a lista de conteúdos concluídos se o vídeo estiver concluído
        let completedContents = [...progressData.completedContents];
        if (progressStatus === 'completed' && !completedContents.includes(contentId)) {
          completedContents.push(contentId);
        }

        await updateDoc(progressRef, {
          contentProgresses: updatedContentProgresses,
          lastAccessedAt: new Date(),
          completedContents
        });
      } else {
        // Criar um novo documento de progresso
        const newProgressData: CourseProgress = {
          courseId,
          userId: user.uid,
          lastAccessedAt: new Date(),
          completedModules: [],
          completedContents: progressStatus === 'completed' ? [contentId] : [],
          contentProgresses: [contentProgress]
        };

        await setDoc(progressRef, newProgressData);
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Erro ao salvar progresso:', err);
      setError('Erro ao salvar progresso do vídeo');
      setLoading(false);
      return { success: false };
    }
  }, [user?.uid]);

  /**
   * Marca um conteúdo como concluído
   */
  const markContentAsCompleted = useCallback(async (
    courseId: string,
    moduleId: string,
    contentId: string,
    extraData?: any
  ): Promise<{success: boolean}> => {
    if (!user?.uid) {
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const progressRef = doc(db, 'courseProgresses', `${user.uid}_${courseId}`);
      const progressDoc = await getDoc(progressRef);
      
      const contentProgress: ContentProgress = {
        contentId,
        moduleId,
        progressStatus: 'completed',
        lastAccessedAt: new Date(),
        progress: 100,
        ...extraData
      };

      if (progressDoc.exists()) {
        const progressData = progressDoc.data() as CourseProgress;
        const existingContentIndex = progressData.contentProgresses.findIndex(
          p => p.contentId === contentId
        );

        let updatedContentProgresses = [...progressData.contentProgresses];
        
        if (existingContentIndex >= 0) {
          updatedContentProgresses[existingContentIndex] = {
            ...updatedContentProgresses[existingContentIndex],
            ...contentProgress
          };
        } else {
          updatedContentProgresses.push(contentProgress);
        }

        // Atualizar a lista de conteúdos concluídos
        let completedContents = [...progressData.completedContents];
        if (!completedContents.includes(contentId)) {
          completedContents.push(contentId);
        }

        // Verificar se todos os conteúdos do módulo estão concluídos
        // Isso requer uma consulta adicional para obter a estrutura do curso
        // que poderia ser implementada aqui

        await updateDoc(progressRef, {
          contentProgresses: updatedContentProgresses,
          lastAccessedAt: new Date(),
          completedContents
        });
      } else {
        // Criar um novo documento de progresso
        const newProgressData: CourseProgress = {
          courseId,
          userId: user.uid,
          lastAccessedAt: new Date(),
          completedModules: [],
          completedContents: [contentId],
          contentProgresses: [contentProgress]
        };

        await setDoc(progressRef, newProgressData);
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Erro ao marcar como concluído:', err);
      setError('Erro ao marcar conteúdo como concluído');
      setLoading(false);
      return { success: false };
    }
  }, [user?.uid]);

  /**
   * Obtém o progresso de um conteúdo específico
   */
  const getContentProgress = useCallback(async (
    courseId: string,
    contentId: string
  ): Promise<ContentProgress | null> => {
    if (!user?.uid) {
      return null;
    }

    try {
      const progressData = await getProgressDoc(courseId);
      
      if (progressData) {
        const contentProgress = progressData.contentProgresses.find(
          p => p.contentId === contentId
        );
        
        return contentProgress || null;
      }
      
      return null;
    } catch (err) {
      console.error('Erro ao obter progresso do conteúdo:', err);
      setError('Erro ao carregar progresso do conteúdo');
      return null;
    }
  }, [user?.uid]);

  /**
   * Obtém o progresso completo do curso
   */
  const getCourseProgress = useCallback(async (
    courseId: string
  ): Promise<CourseProgress | null> => {
    return getProgressDoc(courseId);
  }, [user?.uid]);

  /**
   * Calcula a porcentagem de conclusão do curso
   */
  const getCompletionPercentage = useCallback(async (
    courseId: string
  ): Promise<number> => {
    try {
      // Primeiro, precisamos obter o total de conteúdos no curso
      // Isso exige uma consulta adicional para obter a estrutura completa do curso
      // Aqui assumimos uma implementação simplificada

      // 1. Obter o documento do curso para contar conteúdos
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        return 0;
      }
      
      const courseData = courseDoc.data();
      let totalContents = 0;
      
      if (courseData?.modules && Array.isArray(courseData.modules)) {
        courseData.modules.forEach((module: any) => {
          if (module.contents && Array.isArray(module.contents)) {
            totalContents += module.contents.length;
          }
        });
      }
      
      if (totalContents === 0) {
        return 0;
      }
      
      // 2. Obter o progresso do usuário
      const progressData = await getProgressDoc(courseId);
      
      if (!progressData) {
        return 0;
      }
      
      const completedContents = progressData.completedContents.length;
      
      return Math.round((completedContents / totalContents) * 100);
    } catch (err) {
      console.error('Erro ao calcular porcentagem de conclusão:', err);
      return 0;
    }
  }, [user?.uid]);

  return {
    saveVideoProgress,
    markContentAsCompleted,
    getContentProgress,
    getCourseProgress,
    getCompletionPercentage,
    loading,
    error
  };
}; 