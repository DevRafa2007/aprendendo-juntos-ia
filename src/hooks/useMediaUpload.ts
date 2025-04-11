
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { uploadImage, uploadDocument, deleteMediaByUrl } from '@/services/mediaService';
import { useAuth } from '@/context/AuthContext';

interface UseMediaUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  customPath?: string;
}

interface UseMediaUploadResult {
  isUploading: boolean;
  progress: number;
  mediaUrl: string | null;
  uploadFile: (file: File) => Promise<string | null>;
  deleteMedia: () => Promise<void>;
  error: string | null;
  reset: () => void;
}

/**
 * Hook personalizado para facilitar o upload e gerenciamento de mídia
 */
export function useMediaUpload(options: UseMediaUploadOptions = {}): UseMediaUploadResult {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    onSuccess,
    onError,
    customPath,
  } = options;

  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Reseta o estado do hook
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setMediaUrl(null);
    setError(null);
  }, []);

  /**
   * Faz o upload de um arquivo
   */
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!user?.id) {
      const authError = new Error('Usuário não autenticado');
      setError('Usuário não autenticado. Faça login para continuar.');
      onError?.(authError);
      toast.error('Erro de autenticação', {
        description: 'Você precisa estar logado para fazer upload de arquivos.'
      });
      return null;
    }

    // Valida tipo do arquivo
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      const typeError = new Error(`Tipo de arquivo não suportado: ${file.type}`);
      setError(`Tipo de arquivo não suportado. Tipos permitidos: ${allowedTypes.map(type => type.replace('image/', '')).join(', ')}`);
      onError?.(typeError);
      toast.error('Tipo de arquivo inválido', {
        description: `Apenas os seguintes tipos são permitidos: ${allowedTypes.map(type => type.replace('image/', '')).join(', ')}`
      });
      return null;
    }

    // Valida tamanho do arquivo
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const sizeError = new Error(`Arquivo muito grande: ${(file.size / (1024 * 1024)).toFixed(2)}MB (máximo: ${maxSizeMB}MB)`);
      setError(`Arquivo muito grande: ${(file.size / (1024 * 1024)).toFixed(2)}MB (máximo: ${maxSizeMB}MB)`);
      onError?.(sizeError);
      toast.error('Arquivo muito grande', {
        description: `O arquivo excede o tamanho máximo de ${maxSizeMB}MB.`
      });
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Determina qual função de upload usar baseado no tipo do arquivo
      const isImage = file.type.startsWith('image/');
      
      let url = '';
      if (isImage) {
        url = await uploadImage(file, user.id, {
          onProgress: setProgress,
          customPath,
        });
      } else {
        url = await uploadDocument(file, user.id, {
          onProgress: setProgress,
          customPath,
        });
      }

      setMediaUrl(url);
      setIsUploading(false);
      
      // Chama callback de sucesso se fornecido
      onSuccess?.(url);
      
      toast.success('Upload concluído', {
        description: 'Seu arquivo foi enviado com sucesso.'
      });
      
      return url;
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error('Erro desconhecido no upload');
      console.error('Erro no upload:', uploadError);
      
      setIsUploading(false);
      setProgress(0);
      setError(uploadError.message);
      
      // Chama callback de erro se fornecido
      onError?.(uploadError);
      
      toast.error('Erro no upload', {
        description: uploadError.message || 'Ocorreu um erro ao enviar o arquivo.'
      });
      
      return null;
    }
  }, [user, allowedTypes, maxSizeMB, onSuccess, onError, customPath]);

  /**
   * Deleta a mídia atual
   */
  const deleteMedia = useCallback(async (): Promise<void> => {
    if (!mediaUrl) return;

    try {
      await deleteMediaByUrl(mediaUrl);
      setMediaUrl(null);
      
      toast.success('Mídia removida', {
        description: 'O arquivo foi removido com sucesso.'
      });
    } catch (err) {
      const deleteError = err instanceof Error ? err : new Error('Erro desconhecido ao deletar');
      console.error('Erro ao deletar mídia:', deleteError);
      
      setError(deleteError.message);
      
      toast.error('Erro ao remover', {
        description: deleteError.message || 'Ocorreu um erro ao remover o arquivo.'
      });
    }
  }, [mediaUrl]);

  return {
    isUploading,
    progress,
    mediaUrl,
    uploadFile,
    deleteMedia,
    error,
    reset,
  };
}

export default useMediaUpload;
