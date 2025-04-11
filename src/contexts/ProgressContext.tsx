import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { progressSyncService, ProgressSyncData, ContentInteraction } from '../services/progressSyncService';

// Tipos de dados
interface ContentProgress {
  contentId: string;
  position: number;
  completed: boolean;
  lastUpdated: string;
}

interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  contents: ContentProgress[];
}

interface CourseProgress {
  courseId: string;
  lastAccess: string;
  overallProgress: number;
  modules: ModuleProgress[];
}

interface UserProgress {
  userId: string;
  courses: CourseProgress[];
}

interface ProgressContextType {
  userProgress: UserProgress | null;
  isLoading: boolean;
  error: string | null;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  updateContentProgress: (courseId: string, moduleId: string, contentId: string, position: number, completed: boolean) => Promise<void>;
  markContentAsCompleted: (courseId: string, moduleId: string, contentId: string) => Promise<void>;
  getContentProgress: (courseId: string, moduleId: string, contentId: string) => ContentProgress | null;
  getCourseProgress: (courseId: string) => CourseProgress | null;
  calculateModuleProgress: (courseId: string, moduleId: string) => number;
  syncProgress: () => Promise<void>;
  trackInteraction: (courseId: string, moduleId: string, contentId: string, interactionType: string, data?: Record<string, any>) => Promise<void>;
}

// Tipos de interação
export type InteractionType = 'view' | 'download' | 'play' | 'pause' | 'complete' | 'scroll' | 'answer' | 'progress';

// Valor padrão do contexto
const defaultContextValue: ProgressContextType = {
  userProgress: null,
  isLoading: true,
  error: null,
  isSyncing: false,
  lastSyncTime: null,
  updateContentProgress: async () => {},
  markContentAsCompleted: async () => {},
  getContentProgress: () => null,
  getCourseProgress: () => null,
  calculateModuleProgress: () => 0,
  syncProgress: async () => {},
  trackInteraction: async () => {},
};

// Criando o contexto
export const ProgressContext = createContext<ProgressContextType>(defaultContextValue);

// Hook para usar o contexto
export const useProgress = () => useContext(ProgressContext);

// Provedor do contexto
export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Carregar progresso ao iniciar ou quando mudar de usuário
  useEffect(() => {
    if (!user) {
      setUserProgress(null);
      setIsLoading(false);
      return;
    }

    // Função para carregar o progresso
    const loadProgress = async () => {
      try {
        setIsLoading(true);
        
        // Carregar do localStorage primeiro para exibição rápida
        const storedProgress = localStorage.getItem(`userProgress_${user.id}`);
        let loadedProgress: UserProgress | null = null;
        
        if (storedProgress) {
          loadedProgress = JSON.parse(storedProgress);
          setUserProgress(loadedProgress);
        } else {
          // Inicializa com um objeto vazio se não houver dados
          loadedProgress = {
            userId: user.id,
            courses: []
          };
          setUserProgress(loadedProgress);
        }
        
        // Agora carregar dados mais recentes do servidor (se online)
        if (navigator.onLine) {
          await syncWithBackend();
        }
        
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar progresso:', err);
        setError('Não foi possível carregar seu progresso');
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
    
    // Configurar sincronização periódica
    const syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        await syncWithBackend();
      }
    }, 300000); // A cada 5 minutos
    
    return () => clearInterval(syncInterval);
  }, [user]);

  // Salvar progresso sempre que for atualizado
  useEffect(() => {
    if (user && userProgress) {
      localStorage.setItem(`userProgress_${user.id}`, JSON.stringify(userProgress));
    }
  }, [userProgress, user]);

  // Sincronizar com o backend
  const syncWithBackend = async () => {
    if (!user || !navigator.onLine) return;
    
    try {
      setIsSyncing(true);
      
      // Primeiro, sincronizar quaisquer dados offline
      await progressSyncService.syncOfflineData();
      
      // Buscar todos os progressos do usuário
      const allSyncedProgress = await progressSyncService.getAllUserProgress();
      
      // Converter para o formato do ProgressContext
      if (allSyncedProgress && allSyncedProgress.length > 0) {
        setUserProgress(prev => {
          if (!prev) return prev;
          
          const updatedProgress = { ...prev };
          
          // Para cada item de progresso sincronizado
          for (const syncedItem of allSyncedProgress) {
            // Extrair IDs do contentId (formato: courseId:moduleId:contentId)
            const [courseId, moduleId, actualContentId] = extractIdsFromContentId(syncedItem.contentId);
            
            if (!courseId || !moduleId || !actualContentId) continue;
            
            // Atualizar progresso local com dados do servidor
            updateLocalProgressFromSync(
              updatedProgress,
              courseId,
              moduleId,
              actualContentId,
              syncedItem
            );
          }
          
          return updatedProgress;
        });
      }
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Erro ao sincronizar com o backend:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Extrair IDs do formato composto (courseId:moduleId:contentId)
  const extractIdsFromContentId = (compositeId: string): [string, string, string] => {
    const parts = compositeId.split(':');
    if (parts.length === 3) {
      return [parts[0], parts[1], parts[2]];
    }
    return ['', '', ''];
  };
  
  // Formar ID composto para armazenamento no backend
  const createCompositeContentId = (courseId: string, moduleId: string, contentId: string): string => {
    return `${courseId}:${moduleId}:${contentId}`;
  };
  
  // Atualizar progresso local com dados sincronizados
  const updateLocalProgressFromSync = (
    progress: UserProgress, 
    courseId: string,
    moduleId: string,
    contentId: string,
    syncData: ProgressSyncData
  ) => {
    // Verificar se o curso já existe
    let courseIndex = progress.courses.findIndex(c => c.courseId === courseId);
    
    // Se o curso não existir, criar um novo
    if (courseIndex === -1) {
      progress.courses.push({
        courseId,
        lastAccess: new Date().toISOString(),
        overallProgress: 0,
        modules: []
      });
      courseIndex = progress.courses.length - 1;
    }
    
    // Verificar se o módulo já existe
    let moduleIndex = progress.courses[courseIndex].modules.findIndex(
      m => m.moduleId === moduleId
    );
    
    // Se o módulo não existir, criar um novo
    if (moduleIndex === -1) {
      progress.courses[courseIndex].modules.push({
        moduleId,
        completed: false,
        contents: []
      });
      moduleIndex = progress.courses[courseIndex].modules.length - 1;
    }
    
    // Verificar se o conteúdo já existe
    const contentIndex = progress.courses[courseIndex].modules[moduleIndex].contents.findIndex(
      c => c.contentId === contentId
    );
    
    // Converter posição do lastPosition para número
    let position = 0;
    if (syncData.lastPosition) {
      if (syncData.lastPosition.currentTime !== undefined) {
        position = syncData.lastPosition.currentTime;
      } else if (syncData.lastPosition.currentPage !== undefined) {
        position = syncData.lastPosition.currentPage;
      } else if (syncData.lastPosition.scrollPosition !== undefined) {
        position = syncData.lastPosition.scrollPosition;
      }
    }
    
    // Criar ou atualizar o progresso do conteúdo
    const contentProgress: ContentProgress = {
      contentId,
      position,
      completed: syncData.completed,
      lastUpdated: new Date().toISOString()
    };
    
    if (contentIndex !== -1) {
      progress.courses[courseIndex].modules[moduleIndex].contents[contentIndex] = contentProgress;
    } else {
      progress.courses[courseIndex].modules[moduleIndex].contents.push(contentProgress);
    }
    
    // Verificar conclusão do módulo
    const allContentsCompleted = progress.courses[courseIndex].modules[moduleIndex].contents.every(
      c => c.completed
    );
    
    progress.courses[courseIndex].modules[moduleIndex].completed = allContentsCompleted;
    
    // Recalcular o progresso geral do curso
    const totalModules = progress.courses[courseIndex].modules.length;
    const completedModules = progress.courses[courseIndex].modules.filter(m => m.completed).length;
    
    progress.courses[courseIndex].overallProgress = 
      totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  };

  // Atualizar o progresso de um conteúdo específico
  const updateContentProgress = async (
    courseId: string,
    moduleId: string,
    contentId: string,
    position: number,
    completed: boolean
  ) => {
    if (!user) return;

    // Atualizar estado local
    setUserProgress(prev => {
      if (!prev) return null;

      // Clone do estado atual para modificação
      const updatedProgress = { ...prev };
      
      // Verificar se o curso já existe no progresso
      let courseIndex = updatedProgress.courses.findIndex(c => c.courseId === courseId);
      
      // Se o curso não existir, criar um novo
      if (courseIndex === -1) {
        updatedProgress.courses.push({
          courseId,
          lastAccess: new Date().toISOString(),
          overallProgress: 0,
          modules: []
        });
        courseIndex = updatedProgress.courses.length - 1;
      } else {
        // Atualizar a data de último acesso
        updatedProgress.courses[courseIndex].lastAccess = new Date().toISOString();
      }

      // Verificar se o módulo já existe no curso
      let moduleIndex = updatedProgress.courses[courseIndex].modules.findIndex(
        m => m.moduleId === moduleId
      );
      
      // Se o módulo não existir, criar um novo
      if (moduleIndex === -1) {
        updatedProgress.courses[courseIndex].modules.push({
          moduleId,
          completed: false,
          contents: []
        });
        moduleIndex = updatedProgress.courses[courseIndex].modules.length - 1;
      }

      // Verificar se o conteúdo já existe no módulo
      const contentIndex = updatedProgress.courses[courseIndex].modules[moduleIndex].contents.findIndex(
        c => c.contentId === contentId
      );
      
      // Objeto de progresso atualizado
      const progressData: ContentProgress = {
        contentId,
        position,
        completed,
        lastUpdated: new Date().toISOString()
      };
      
      // Se o conteúdo já existir, atualizar. Caso contrário, adicionar
      if (contentIndex !== -1) {
        updatedProgress.courses[courseIndex].modules[moduleIndex].contents[contentIndex] = progressData;
      } else {
        updatedProgress.courses[courseIndex].modules[moduleIndex].contents.push(progressData);
      }

      // Verificar se todos os conteúdos do módulo estão completos
      const allContentsCompleted = updatedProgress.courses[courseIndex].modules[moduleIndex].contents.every(
        c => c.completed
      );
      
      // Atualizar estado de conclusão do módulo
      updatedProgress.courses[courseIndex].modules[moduleIndex].completed = allContentsCompleted;

      // Calcular o progresso geral do curso
      const totalModules = updatedProgress.courses[courseIndex].modules.length;
      const completedModules = updatedProgress.courses[courseIndex].modules.filter(m => m.completed).length;
      
      updatedProgress.courses[courseIndex].overallProgress = 
        totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

      return updatedProgress;
    });
    
    // Sincronizar com o backend
    try {
      // Criar o ID composto
      const compositeContentId = createCompositeContentId(courseId, moduleId, contentId);
      
      // Preparar dados de acordo com o tipo de conteúdo
      const lastPosition = {
        currentTime: position // Para vídeos, adaptar conforme necessário para outros tipos
      };
      
      // Salvar via serviço de sincronização
      await progressSyncService.saveProgress({
        contentId: compositeContentId,
        progressPercent: completed ? 100 : Math.min(99, Math.round(position * 100)),
        completed,
        lastPosition
      });
      
      // Registrar interação
      const interactionType = completed ? 'complete' : 'view'; // Changed from 'progress' to 'view'
      await progressSyncService.trackInteraction({
        contentId: compositeContentId,
        interactionType,
        interactionData: { position }
      });
    } catch (error) {
      console.error('Erro ao sincronizar progresso com o backend:', error);
      // Continuar usando o estado local mesmo em caso de erro na sincronização
    }
  };

  // Marcar um conteúdo como concluído
  const markContentAsCompleted = async (
    courseId: string,
    moduleId: string,
    contentId: string
  ) => {
    const currentProgress = getContentProgress(courseId, moduleId, contentId);
    await updateContentProgress(
      courseId,
      moduleId,
      contentId,
      currentProgress?.position || 0,
      true
    );
  };

  // Obter o progresso de um conteúdo específico
  const getContentProgress = (
    courseId: string,
    moduleId: string,
    contentId: string
  ): ContentProgress | null => {
    if (!userProgress) return null;

    const course = userProgress.courses.find(c => c.courseId === courseId);
    if (!course) return null;

    const module = course.modules.find(m => m.moduleId === moduleId);
    if (!module) return null;

    const content = module.contents.find(c => c.contentId === contentId);
    return content || null;
  };

  // Obter o progresso de um curso específico
  const getCourseProgress = (courseId: string): CourseProgress | null => {
    if (!userProgress) return null;
    return userProgress.courses.find(c => c.courseId === courseId) || null;
  };

  // Calcular o progresso de um módulo específico
  const calculateModuleProgress = (courseId: string, moduleId: string): number => {
    if (!userProgress) return 0;

    const course = userProgress.courses.find(c => c.courseId === courseId);
    if (!course) return 0;

    const module = course.modules.find(m => m.moduleId === moduleId);
    if (!module) return 0;

    const totalContents = module.contents.length;
    const completedContents = module.contents.filter(c => c.completed).length;

    return totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;
  };
  
  // Sincronizar progresso manualmente
  const syncProgress = async () => {
    await syncWithBackend();
  };
  
  // Rastrear interação do usuário com o conteúdo
  const trackInteraction = async (
    courseId: string,
    moduleId: string,
    contentId: string,
    interactionType: string,
    data?: Record<string, any>
  ) => {
    if (!user) return;
    
    try {
      const compositeContentId = createCompositeContentId(courseId, moduleId, contentId);
      
      await progressSyncService.trackInteraction({
        contentId: compositeContentId,
        interactionType: interactionType as any,
        interactionData: data
      });
    } catch (error) {
      console.error('Erro ao rastrear interação:', error);
    }
  };

  // Valor do contexto
  const contextValue: ProgressContextType = {
    userProgress,
    isLoading,
    error,
    isSyncing,
    lastSyncTime,
    updateContentProgress,
    markContentAsCompleted,
    getContentProgress,
    getCourseProgress,
    calculateModuleProgress,
    syncProgress,
    trackInteraction
  };

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
};
