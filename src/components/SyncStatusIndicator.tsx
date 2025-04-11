import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProgress } from '@/contexts/ProgressContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Cloud, CloudOff, Check, RefreshCw } from 'lucide-react';

/**
 * Componente que exibe o estado de sincronização do progresso do aluno
 * Mostra ícones diferentes baseados no estado atual e permite sincronização manual
 */
const SyncStatusIndicator = () => {
  const { isSyncing, lastSyncTime, syncProgress } = useProgress();
  const { toast } = useToast();
  
  const handleSyncClick = async () => {
    try {
      await syncProgress();
      toast({
        title: 'Sincronização concluída',
        description: 'Seu progresso foi sincronizado com o servidor.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar seu progresso. Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };
  
  const formatSyncTime = (date: Date): string => {
    // Se for hoje, mostrar apenas a hora
    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();
    
    if (isToday) {
      return `Hoje às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Se for ontem
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === date.toDateString();
    
    if (isYesterday) {
      return `Ontem às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Caso contrário, mostrar a data completa
    return `${date.toLocaleDateString()} às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Status quando offline
  if (!navigator.onLine) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 text-yellow-500">
              <CloudOff size={18} />
              <span className="text-xs hidden sm:inline">Offline</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Você está offline. Seu progresso será sincronizado quando a conexão for restabelecida.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Status quando sincronizando
  if (isSyncing) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 text-blue-500 animate-pulse">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-xs hidden sm:inline">Sincronizando...</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sincronizando seu progresso com o servidor...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Status quando sincronizado com sucesso
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleSyncClick}
            >
              {lastSyncTime ? (
                <div className="flex items-center space-x-1">
                  <Check size={18} />
                  <span className="text-xs hidden sm:inline">
                    Atualizado: {formatSyncTime(lastSyncTime)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <Cloud size={18} />
                  <span className="text-xs hidden sm:inline">Sincronizar</span>
                </div>
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {lastSyncTime ? (
            <p>Último sincronizado em {formatSyncTime(lastSyncTime)}. Clique para sincronizar novamente.</p>
          ) : (
            <p>Clique para sincronizar seu progresso.</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncStatusIndicator; 