import { supabase } from '@/integrations/supabase/client';

// Tipos de mídia suportados
export type MediaType = 'image' | 'video' | 'document';

export interface UploadOptions {
  /**
   * Função de callback para atualizar o progresso do upload
   */
  onProgress?: (progress: number) => void;
  
  /**
   * Caminho personalizado dentro do bucket
   */
  customPath?: string;
  
  /**
   * Nome personalizado para o arquivo
   */
  customName?: string;
}

/**
 * Verifica a existência de um bucket e cria se não existir
 * @param bucketName Nome do bucket para verificar
 * @returns Promessa resolvida com true se o bucket existe ou foi criado, false caso contrário
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    // Se ocorrer erro na listagem, tentamos criar o bucket diretamente
    if (listError) {
      console.error(`Erro ao listar buckets: ${listError.message}`);
      console.log(`Tentando criar bucket '${bucketName}' diretamente...`);
      
      // Tentar criar o bucket sem verificar se já existe
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (createError) {
        // Se o erro for "bucket already exists", consideramos como sucesso
        if (createError.message.includes('already exists')) {
          console.log(`Bucket '${bucketName}' já existe.`);
          return true;
        }
        
        console.error(`Erro ao criar bucket '${bucketName}': ${createError.message}`);
        return false;
      }
      
      console.log(`Bucket '${bucketName}' criado com sucesso!`);
      return true;
    }
    
    // Verificar se o bucket existe na lista
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket '${bucketName}' já existe.`);
      return true;
    }
    
    // Criar o bucket se não existir
    console.log(`Criando bucket '${bucketName}'...`);
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    
    if (createError) {
      console.error(`Erro ao criar bucket '${bucketName}': ${createError.message}`);
      return false;
    }
    
    console.log(`Bucket '${bucketName}' criado com sucesso!`);
    return true;
  } catch (error) {
    console.error('Erro ao verificar/criar bucket:', error);
    return false;
  }
};

/**
 * Inicializa os buckets necessários para o armazenamento de mídia
 */
export const initializeStorageBuckets = async (): Promise<void> => {
  console.log('Configurando todos os buckets necessários...');
  
  try {
    // Primeiro, verifique permissões tentando listar os buckets existentes
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets. Verificando permissões:', listError.message);
      
      // Se o erro for relacionado a permissões, registre e pare
      if (listError.message.includes('permission') || listError.message.includes('not authorized')) {
        console.warn('Sem permissões para gerenciar buckets. Ignorando criação de buckets.');
        console.warn('Buckets precisam ser criados manualmente pelo administrador:');
        console.warn('- course-images (público)');
        console.warn('- course-videos (público)');
        console.warn('- course-documents (público)');
        return;
      }
    }
    
    // Se chegou aqui, temos permissão para criar buckets
    const requiredBuckets = ['course-images', 'course-videos', 'course-documents'];
    
    for (const bucket of requiredBuckets) {
      console.log(`Verificando bucket ${bucket}...`);
      try {
        await ensureBucketExists(bucket);
      } catch (err) {
        console.error(`Erro ao verificar bucket ${bucket}:`, err);
      }
    }
    
    console.log('Configuração de buckets concluída');
  } catch (error) {
    console.error('Erro durante inicialização de buckets:', error);
  }
};

// Função para gerar um nome de arquivo único
const generateUniqueFileName = (userId: string, fileName: string): string => {
  const fileExt = fileName.split('.').pop();
  return `${userId}-${new Date().getTime()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
};

// Função para determinar o bucket com base no tipo de mídia
const getBucketName = (mediaType: MediaType | string): string => {
  switch (mediaType) {
    case 'image':
    case 'images':
      return 'course-images';
    case 'video':
    case 'videos':
      return 'course-videos';
    case 'document':
    case 'documents':
      return 'course-documents';
    default:
      return 'course-assets';
  }
};

/**
 * Faz upload de um vídeo para o armazenamento
 */
export const uploadVideo = async (
  file: File,
  userId: string,
  options?: UploadOptions
): Promise<string> => {
  return uploadMedia(file, userId, 'videos', options);
};

/**
 * Faz upload de um documento para o armazenamento
 */
export const uploadDocument = async (
  file: File,
  userId: string,
  options?: UploadOptions
): Promise<string> => {
  return uploadMedia(file, userId, 'documents', options);
};

/**
 * Faz upload de uma imagem para o armazenamento
 */
export const uploadImage = async (
  file: File,
  userId: string,
  options?: UploadOptions
): Promise<string> => {
  return uploadMedia(file, userId, 'images', options);
};

/**
 * Função genérica para upload de mídia usando Supabase Storage
 */
const uploadMedia = async (
  file: File,
  userId: string | undefined,
  mediaType: 'videos' | 'images' | 'documents',
  options?: UploadOptions
): Promise<string> => {
  if (!file) {
    throw new Error('Nenhum arquivo fornecido');
  }
  
  // Verificar se o userId está definido
  if (!userId) {
    console.error('ID de usuário não definido para upload de mídia');
    throw new Error('ID de usuário não definido. Você precisa estar autenticado para fazer upload de arquivos.');
  }
  
  console.log(`Iniciando upload para: Usuário ${userId}, Tipo: ${mediaType}, Arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  
  // Determinar bucket correto
  const bucketName = getBucketName(mediaType);
  
  // Verificar e criar bucket se necessário
  const bucketExists = await ensureBucketExists(bucketName);
  if (!bucketExists) {
    throw new Error(`Bucket not found: ${bucketName}`);
  }
  
  // Gerar nome de arquivo único
  const fileName = options?.customName || generateUniqueFileName(userId, file.name);
  
  // Criar caminho personalizado ou usar padrão
  const path = options?.customPath 
    ? `${options.customPath}/${fileName}` 
    : `users/${userId}/${fileName}`;
  
  console.log(`Iniciando upload para Supabase Storage: bucket=${bucketName}, path=${path}`);
  
  try {
    // Implementar um sistema de rastreamento de progresso customizado
    // já que o Supabase não oferece isso nativamente
    let lastTimeReported = Date.now();
    const totalSize = file.size;
    let lastProgress = 0;
    
    // Chamar a função de progresso inicial (0%)
    options?.onProgress?.(0);
    
    // Iniciar o upload
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        onUploadProgress: (progress) => {
          // Supabase pode ou não fornecer eventos de progresso,
          // dependendo do ambiente e do navegador
          if (progress && options?.onProgress) {
            const now = Date.now();
            const percent = Math.round((progress.loaded / progress.total) * 100);
            
            // Limitar atualizações de progresso para reduzir carga na UI
            // Reportar no máximo a cada 500ms ou se o progresso aumentou mais de 5%
            if (now - lastTimeReported > 500 || percent - lastProgress > 5) {
              console.log(`Progresso de upload: ${percent}%`);
              options.onProgress(percent);
              lastTimeReported = now;
              lastProgress = percent;
            }
          }
        }
      });
    
    if (error) {
      console.error('Erro ao fazer upload:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }
    
    if (!data || !data.path) {
      throw new Error('Upload concluído, mas dados do arquivo não retornados');
    }
    
    // Sinalizar 100% de progresso
    options?.onProgress?.(100);
    
    // Obter a URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    console.log('Upload concluído com sucesso. URL:', publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error('Erro durante upload:', err);
    throw new Error(err.message || 'Erro desconhecido durante o upload');
  }
};

/**
 * Exclui um arquivo do armazenamento pela URL
 */
export const deleteMediaByUrl = async (url: string): Promise<void> => {
  try {
    // Extrair informações da URL
    // O formato típico da URL do Supabase é:
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    
    // Procurar segmento após 'public' que é o nome do bucket
    const publicIndex = pathSegments.findIndex(segment => segment === 'public');
    
    if (publicIndex === -1 || publicIndex >= pathSegments.length - 2) {
      throw new Error('Formato de URL inválido');
    }
    
    const bucketName = pathSegments[publicIndex + 1];
    const filePath = pathSegments.slice(publicIndex + 2).join('/');
    
    console.log(`Removendo arquivo: bucket=${bucketName}, path=${filePath}`);
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    console.log('Arquivo removido com sucesso');
  } catch (error) {
    console.error('Erro ao remover arquivo:', error);
    throw error;
  }
};

/**
 * Obtém o tipo MIME de um arquivo
 * @param file Arquivo a ser analisado
 * @returns MediaType correspondente ao arquivo
 */
export const getMediaTypeFromFile = (file: File): MediaType => {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  } else {
    return 'document';
  }
};

/**
 * Extrai o nome do arquivo a partir da URL
 * @param url URL do arquivo
 * @returns Nome do arquivo ou string vazia
 */
export const getFileNameFromUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // Extrai o nome do arquivo da URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const fileName = pathSegments[pathSegments.length - 1];
    
    // Remover possíveis parâmetros de query string
    return fileName.split('?')[0];
  } catch (error) {
    console.error('Erro ao extrair nome do arquivo:', error);
    return '';
  }
};

/**
 * Obtém a extensão do arquivo a partir do nome
 * @param fileName Nome do arquivo
 * @returns Extensão do arquivo
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Verifica se um arquivo é uma imagem a partir do nome
 * @param fileName Nome do arquivo
 * @returns true se for uma imagem
 */
export const isImageFile = (fileName: string): boolean => {
  const ext = getFileExtension(fileName);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
};

/**
 * Verifica se um arquivo é um documento a partir do nome
 * @param fileName Nome do arquivo
 * @returns true se for um documento
 */
export const isDocumentFile = (fileName: string): boolean => {
  const ext = getFileExtension(fileName);
  return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext);
};

/**
 * Retorna a URL correta para um arquivo, considerando possíveis diretórios públicos
 * @param url URL do arquivo
 * @returns URL corrigida
 */
export const getCorrectMediaUrl = (url: string | null): string => {
  if (!url) return '';
  
  // Verificar se a URL já está no formato correto
  if (url.includes('storage/v1/object/public')) {
    return url;
  }
  
  // Se a URL for um caminho relativo, converta para formato absoluto
  if (url.startsWith('/')) {
    const baseUrl = window.location.origin;
    return `${baseUrl}${url}`;
  }
  
  return url;
};

export default {
  uploadImage,
  uploadDocument,
  uploadVideo,
  deleteMediaByUrl,
  getFileNameFromUrl,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  getCorrectMediaUrl,
}; 