import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Tipos para os dados de progresso
export type ProgressSyncData = {
  contentId: string;
  progressPercent: number;
  completed: boolean;
  lastPosition?: {
    currentTime?: number; // Para vídeos (em segundos)
    currentPage?: number; // Para documentos
    scrollPosition?: number; // Para conteúdo de texto
    quizAnswers?: Record<string, any>; // Para quizzes
  };
};

// Tipo para interações com o conteúdo
export type ContentInteraction = {
  contentId: string;
  interactionType: 'view' | 'play' | 'pause' | 'complete' | 'scroll' | 'answer' | 'download';
  interactionData?: Record<string, any>;
};

// Interface para o serviço de sincronização
export interface ProgressSyncServiceInterface {
  saveProgress(data: ProgressSyncData): Promise<void>;
  getProgress(contentId: string): Promise<ProgressSyncData | null>;
  getAllUserProgress(): Promise<ProgressSyncData[]>;
  trackInteraction(interaction: ContentInteraction): Promise<void>;
  syncOfflineData(): Promise<void>;
  getOfflineQueue(): Promise<Tables<'sync_queue'>[]>;
}

/**
 * Classe para gerenciar a sincronização de progresso do aluno
 * Implementa mecanismos para persistir e restaurar o progresso,
 * além de sincronizar dados offline quando a conexão é restabelecida
 */
class ProgressSyncService implements ProgressSyncServiceInterface {
  private localStorageKey = 'user_progress';
  private offlineQueueKey = 'offline_sync_queue';
  private userId: string | null = null;

  constructor() {
    // Verificar se o usuário está logado
    this.initializeUserId();
    
    // Adicionar listener para sincronizar quando online
    window.addEventListener('online', this.handleOnline);
  }

  /**
   * Inicializa o ID do usuário atual
   * @private
   */
  private async initializeUserId(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.userId = user.id;
    }
  }

  /**
   * Manipulador para quando o navegador fica online
   * @private
   */
  private handleOnline = async (): Promise<void> => {
    console.log('Conexão de internet restaurada. Sincronizando dados...');
    try {
      await this.syncOfflineData();
    } catch (error) {
      console.error('Erro ao sincronizar dados offline:', error);
    }
  };

  /**
   * Salva o progresso do aluno em um conteúdo
   * Se online, salva no Supabase; se offline, guarda no localStorage
   * @param data Dados de progresso a serem salvos
   */
  public async saveProgress(data: ProgressSyncData): Promise<void> {
    if (!this.userId) {
      await this.initializeUserId();
      if (!this.userId) {
        console.error('Usuário não está autenticado');
        return;
      }
    }

    const progressData = {
      user_id: this.userId,
      content_id: data.contentId,
      progress_percent: data.progressPercent,
      completed: data.completed,
      last_position: data.lastPosition || null,
      client_timestamp: Date.now(),
      version: 1, // Iniciar com versão 1
    };

    try {
      // Tentar salvar no Supabase
      if (navigator.onLine) {
        const { error, data: existingProgress } = await supabase
          .from('student_progress_sync')
          .select('id, version')
          .match({ user_id: this.userId, content_id: data.contentId })
          .maybeSingle();

        if (error) throw error;

        if (existingProgress) {
          // Incrementar versão para evitar conflitos
          const { error: updateError } = await supabase
            .from('student_progress_sync')
            .update({
              ...progressData,
              version: existingProgress.version + 1,
              last_synced_at: new Date().toISOString(),
            })
            .match({ id: existingProgress.id });

          if (updateError) throw updateError;
        } else {
          // Inserir novo registro
          const { error: insertError } = await supabase
            .from('student_progress_sync')
            .insert({
              ...progressData,
              last_synced_at: new Date().toISOString(),
            });

          if (insertError) throw insertError;
        }

        // Salvar localmente também para acesso rápido
        this.saveProgressLocally(data);
      } else {
        // Offline: Adicionar à fila de sincronização
        this.addToOfflineQueue('progress', progressData);
        
        // Salvar localmente
        this.saveProgressLocally(data);
      }
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      // Em caso de falha, salvar localmente para sincronização posterior
      this.addToOfflineQueue('progress', progressData);
      this.saveProgressLocally(data);
    }
  }

  /**
   * Obtém o progresso do aluno em um conteúdo específico
   * @param contentId ID do conteúdo
   * @returns Dados de progresso ou null se não existir
   */
  public async getProgress(contentId: string): Promise<ProgressSyncData | null> {
    if (!this.userId) {
      await this.initializeUserId();
      if (!this.userId) {
        console.error('Usuário não está autenticado');
        return null;
      }
    }

    try {
      // Primeiro verificar localmente para resposta rápida
      const localProgress = this.getProgressLocally(contentId);
      
      // Se estiver online, verificar no Supabase para dados mais atualizados
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('student_progress_sync')
          .select('*')
          .match({ user_id: this.userId, content_id: contentId })
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const progressData: ProgressSyncData = {
            contentId: data.content_id,
            progressPercent: data.progress_percent,
            completed: data.completed,
            lastPosition: data.last_position as any,
          };

          // Atualizar cache local se o dado do servidor for mais recente
          if (!localProgress || data.version > (localProgress as any).version) {
            this.saveProgressLocally(progressData);
          }

          return progressData;
        }
      }

      // Retornar dados locais caso esteja offline ou não tenha encontrado no servidor
      return localProgress;
    } catch (error) {
      console.error('Erro ao obter progresso:', error);
      // Em caso de erro, usar dados locais
      return this.getProgressLocally(contentId);
    }
  }

  /**
   * Obtém todo o progresso do usuário atual
   * @returns Lista de todos os progressos
   */
  public async getAllUserProgress(): Promise<ProgressSyncData[]> {
    if (!this.userId) {
      await this.initializeUserId();
      if (!this.userId) {
        console.error('Usuário não está autenticado');
        return [];
      }
    }

    try {
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('student_progress_sync')
          .select('*')
          .eq('user_id', this.userId);

        if (error) throw error;

        if (data) {
          const progressList = data.map(item => ({
            contentId: item.content_id,
            progressPercent: item.progress_percent,
            completed: item.completed,
            lastPosition: item.last_position as any,
          }));

          // Atualizar cache local
          this.saveAllProgressLocally(progressList);

          return progressList;
        }
      }

      // Se offline, retornar dados locais
      return this.getAllProgressLocally();
    } catch (error) {
      console.error('Erro ao obter todos os progressos:', error);
      // Em caso de erro, usar dados locais
      return this.getAllProgressLocally();
    }
  }

  /**
   * Registra uma interação do usuário com o conteúdo
   * @param interaction Dados da interação
   */
  public async trackInteraction(interaction: ContentInteraction): Promise<void> {
    if (!this.userId) {
      await this.initializeUserId();
      if (!this.userId) {
        console.error('Usuário não está autenticado');
        return;
      }
    }

    const interactionData = {
      user_id: this.userId,
      content_id: interaction.contentId,
      interaction_type: interaction.interactionType,
      interaction_data: interaction.interactionData || null,
      client_timestamp: Date.now(),
      synced: navigator.onLine,
    };

    try {
      if (navigator.onLine) {
        const { error } = await supabase
          .from('content_interactions')
          .insert(interactionData);

        if (error) throw error;
      } else {
        // Offline: Adicionar à fila
        this.addToOfflineQueue('interaction', interactionData);
      }
    } catch (error) {
      console.error('Erro ao registrar interação:', error);
      this.addToOfflineQueue('interaction', interactionData);
    }
  }

  /**
   * Sincroniza dados offline quando a conexão é restaurada
   */
  public async syncOfflineData(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Sincronização não possível: dispositivo offline');
      return;
    }

    if (!this.userId) {
      await this.initializeUserId();
      if (!this.userId) {
        console.error('Usuário não está autenticado');
        return;
      }
    }

    try {
      const offlineQueue = this.getOfflineQueueFromStorage();
      if (!offlineQueue.length) {
        console.log('Nenhum dado para sincronizar');
        return;
      }

      console.log(`Sincronizando ${offlineQueue.length} itens...`);

      // Processar itens da fila
      for (const item of offlineQueue) {
        try {
          if (item.queue_type === 'progress') {
            await this.syncProgressItem(item);
          } else if (item.queue_type === 'interaction') {
            await this.syncInteractionItem(item);
          }
          
          // Remover item da fila após sincronização bem-sucedida
          this.removeFromOfflineQueue(item.id);
        } catch (error) {
          console.error(`Erro ao sincronizar item ${item.id}:`, error);
          // Incrementar contador de tentativas
          this.updateOfflineQueueItem(item.id, {
            ...item,
            retry_count: (item.retry_count || 0) + 1,
            status: 'failed',
            error_message: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // Registrar dados de sincronização no banco de dados
      await this.registerSyncSession();
    } catch (error) {
      console.error('Erro durante sincronização:', error);
    }
  }

  /**
   * Obtém a fila de itens para sincronização
   */
  public async getOfflineQueue(): Promise<Tables<'sync_queue'>[]> {
    if (!this.userId) return [];

    try {
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('sync_queue')
          .select('*')
          .eq('user_id', this.userId)
          .eq('status', 'pending');

        if (error) throw error;
        return data || [];
      } else {
        return this.getOfflineQueueFromStorage();
      }
    } catch (error) {
      console.error('Erro ao obter fila offline:', error);
      return this.getOfflineQueueFromStorage();
    }
  }

  /**
   * Sincroniza um item de progresso
   * @private
   */
  private async syncProgressItem(item: Tables<'sync_queue'>): Promise<void> {
    const progressData = item.payload as any;
    
    // Verificar se já existe um progresso
    const { data: existingProgress, error: selectError } = await supabase
      .from('student_progress_sync')
      .select('id, version, client_timestamp')
      .match({ user_id: this.userId, content_id: progressData.content_id })
      .maybeSingle();

    if (selectError) throw selectError;

    if (existingProgress) {
      // Só atualizar se o timestamp do cliente for mais recente
      if (!existingProgress.client_timestamp || 
          progressData.client_timestamp > existingProgress.client_timestamp) {
        const { error: updateError } = await supabase
          .from('student_progress_sync')
          .update({
            ...progressData,
            version: existingProgress.version + 1,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);

        if (updateError) throw updateError;
      }
    } else {
      // Inserir novo progresso
      const { error: insertError } = await supabase
        .from('student_progress_sync')
        .insert({
          ...progressData,
          last_synced_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }
  }

  /**
   * Sincroniza um item de interação
   * @private
   */
  private async syncInteractionItem(item: Tables<'sync_queue'>): Promise<void> {
    const interactionData = item.payload as any;
    
    const { error } = await supabase
      .from('content_interactions')
      .insert({ ...interactionData, synced: true });

    if (error) throw error;
  }

  /**
   * Registra sessão de sincronização
   * @private
   */
  private async registerSyncSession(): Promise<void> {
    try {
      // Atualizar sessão do usuário se existir, ou criar nova
      const { data: existingSession, error: selectError } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', this.userId)
        .maybeSingle();

      if (selectError) throw selectError;

      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      };

      if (existingSession) {
        const { error: updateError } = await supabase
          .from('user_sessions')
          .update({
            last_activity: new Date().toISOString(),
            is_online: true,
            device_info: JSON.stringify(deviceInfo),
          })
          .eq('id', existingSession.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: this.userId,
            last_activity: new Date().toISOString(),
            is_online: true,
            device_info: JSON.stringify(deviceInfo),
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Erro ao registrar sessão de sincronização:', error);
    }
  }

  // ================= Gerenciamento do localStorage =================

  /**
   * Salva um item de progresso localmente
   * @private
   */
  private saveProgressLocally(data: ProgressSyncData): void {
    if (!this.userId) return;

    try {
      const allProgress = this.getAllProgressLocally();
      const existingIndex = allProgress.findIndex(p => p.contentId === data.contentId);

      if (existingIndex >= 0) {
        allProgress[existingIndex] = data;
      } else {
        allProgress.push(data);
      }

      localStorage.setItem(
        `${this.localStorageKey}_${this.userId}`,
        JSON.stringify(allProgress)
      );
    } catch (error) {
      console.error('Erro ao salvar progresso localmente:', error);
    }
  }

  /**
   * Salva todos os itens de progresso localmente
   * @private
   */
  private saveAllProgressLocally(progressList: ProgressSyncData[]): void {
    if (!this.userId) return;

    try {
      localStorage.setItem(
        `${this.localStorageKey}_${this.userId}`,
        JSON.stringify(progressList)
      );
    } catch (error) {
      console.error('Erro ao salvar todos os progressos localmente:', error);
    }
  }

  /**
   * Obtém um item de progresso do armazenamento local
   * @private
   */
  private getProgressLocally(contentId: string): ProgressSyncData | null {
    if (!this.userId) return null;

    try {
      const allProgress = this.getAllProgressLocally();
      return allProgress.find(p => p.contentId === contentId) || null;
    } catch (error) {
      console.error('Erro ao obter progresso localmente:', error);
      return null;
    }
  }

  /**
   * Obtém todos os itens de progresso do armazenamento local
   * @private
   */
  private getAllProgressLocally(): ProgressSyncData[] {
    if (!this.userId) return [];

    try {
      const storedData = localStorage.getItem(`${this.localStorageKey}_${this.userId}`);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Erro ao obter todos os progressos localmente:', error);
      return [];
    }
  }

  // ================= Gerenciamento da fila offline =================

  /**
   * Adiciona um item à fila offline
   * @private
   */
  private addToOfflineQueue(queueType: string, payload: any): void {
    if (!this.userId) return;

    try {
      const queue = this.getOfflineQueueFromStorage();
      const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const queueItem: Tables<'sync_queue'> = {
        id,
        user_id: this.userId,
        queue_type: queueType,
        payload,
        status: 'pending',
        error_message: null,
        retry_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        processed_at: null
      };

      queue.push(queueItem);
      this.saveOfflineQueueToStorage(queue);

      console.log(`Item adicionado à fila offline (${id})`);
    } catch (error) {
      console.error('Erro ao adicionar item à fila offline:', error);
    }
  }

  /**
   * Remove um item da fila offline
   * @private
   */
  private removeFromOfflineQueue(id: string): void {
    try {
      const queue = this.getOfflineQueueFromStorage();
      const updatedQueue = queue.filter(item => item.id !== id);
      this.saveOfflineQueueToStorage(updatedQueue);
    } catch (error) {
      console.error('Erro ao remover item da fila offline:', error);
    }
  }

  /**
   * Atualiza um item na fila offline
   * @private
   */
  private updateOfflineQueueItem(id: string, updatedItem: Tables<'sync_queue'>): void {
    try {
      const queue = this.getOfflineQueueFromStorage();
      const updatedQueue = queue.map(item => item.id === id ? updatedItem : item);
      this.saveOfflineQueueToStorage(updatedQueue);
    } catch (error) {
      console.error('Erro ao atualizar item na fila offline:', error);
    }
  }

  /**
   * Obtém a fila offline do armazenamento local
   * @private
   */
  private getOfflineQueueFromStorage(): Tables<'sync_queue'>[] {
    if (!this.userId) return [];

    try {
      const storedQueue = localStorage.getItem(`${this.offlineQueueKey}_${this.userId}`);
      return storedQueue ? JSON.parse(storedQueue) : [];
    } catch (error) {
      console.error('Erro ao obter fila offline do armazenamento:', error);
      return [];
    }
  }

  /**
   * Salva a fila offline no armazenamento local
   * @private
   */
  private saveOfflineQueueToStorage(queue: Tables<'sync_queue'>[]): void {
    if (!this.userId) return;

    try {
      localStorage.setItem(
        `${this.offlineQueueKey}_${this.userId}`,
        JSON.stringify(queue)
      );
    } catch (error) {
      console.error('Erro ao salvar fila offline no armazenamento:', error);
    }
  }
}

// Exportar uma instância singleton do serviço
export const progressSyncService = new ProgressSyncService();

// Também exportar a classe para testes e casos especiais
export { ProgressSyncService }; 