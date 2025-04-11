import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadVideo, deleteMediaByUrl } from '@/services/mediaService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { VideoContent } from '@/types/course';
import { Upload, X, PlayCircle, FileVideo, Image as ImageIcon, Clock } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from 'sonner';
import ImageUploader from '@/components/ImageUploader';

interface VideoUploaderProps {
  content: VideoContent;
  onVideoUploaded: (videoUrl: string, duration: number, thumbnailUrl?: string) => void;
  disabled?: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  content, 
  onVideoUploaded,
  disabled = false
}) => {
  const { user, profile } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState({
    url: content.video_url || '',
    duration: content.video_duration || 0,
    thumbnailUrl: content.thumbnail_url || ''
  });
  const [editingThumbnail, setEditingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    setVideoInfo({
      url: content.video_url || '',
      duration: content.video_duration || 0,
      thumbnailUrl: content.thumbnail_url || ''
    });
  }, [content]);
  
  // Função para lidar com a seleção de arquivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('Nenhum arquivo selecionado');
      return;
    }
    
    if (!user || !user.id) {
      console.error('Usuário não autenticado ou ID não disponível:', user);
      setError('Você precisa estar autenticado para fazer upload de vídeos');
      toast.error('Erro de autenticação', {
        description: 'Você precisa estar autenticado para fazer upload de vídeos'
      });
      return;
    }
    
    console.log('Upload de vídeo iniciado:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id
    });
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido.');
      toast.error('Formato inválido', {
        description: 'Por favor, selecione um arquivo de vídeo válido.'
      });
      return;
    }
    
    // Limite de tamanho (100MB)
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError('O arquivo é muito grande. O tamanho máximo é 100MB.');
      toast.error('Arquivo muito grande', {
        description: 'O tamanho máximo é 100MB.'
      });
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Fazer upload do vídeo
      const videoUrl = await uploadVideo(file, user.id, {
        onProgress: (progress) => {
          console.log(`Progresso de upload: ${progress}%`);
          setUploadProgress(progress);
        }
      });
      
      if (!videoUrl) {
        throw new Error('Falha ao fazer upload do vídeo.');
      }
      
      console.log('Vídeo enviado com sucesso:', videoUrl);
      
      // Criar um elemento de vídeo para extrair metadados
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      // Função para extrair o thumbnail do vídeo
      const extractThumbnail = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 360;
          // Capturar um frame de 25% do vídeo para usar como thumbnail
          video.currentTime = video.duration * 0.25;
          
          video.onseeked = () => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              // Converter para blob e fazer upload
              canvas.toBlob(async (blob) => {
                if (blob && user) {
                  try {
                    // Aqui poderia ser implementado o upload do thumbnail
                    // Por enquanto, apenas usamos o dataURL
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    const durationInSeconds = Math.round(video.duration);
                    
                    setVideoInfo({
                      url: videoUrl,
                      duration: durationInSeconds,
                      thumbnailUrl: dataUrl
                    });
                    
                    onVideoUploaded(videoUrl, durationInSeconds, dataUrl);
                    setIsUploading(false);
                    
                    toast.success('Vídeo enviado com sucesso!', {
                      description: `Duração: ${formatDuration(durationInSeconds)}`
                    });
                  } catch (err) {
                    console.error('Erro ao processar thumbnail:', err);
                    // Se falhar o thumbnail, ainda retornamos o vídeo
                    const durationInSeconds = Math.round(video.duration);
                    onVideoUploaded(videoUrl, durationInSeconds);
                    setIsUploading(false);
                  }
                }
              }, 'image/jpeg', 0.7);
            }
          };
        } catch (err) {
          console.error('Erro ao extrair thumbnail:', err);
          const durationInSeconds = Math.round(video.duration);
          onVideoUploaded(videoUrl, durationInSeconds);
          setIsUploading(false);
        }
      };
      
      video.onloadedmetadata = () => {
        extractThumbnail();
      };
      
      video.onerror = () => {
        console.error('Erro ao carregar metadados do vídeo:', video.error);
        setError('Não foi possível obter informações do vídeo.');
        toast.error('Erro no processamento', {
          description: 'Não foi possível obter informações do vídeo.'
        });
        
        // Mesmo com erro, retornamos o URL do vídeo com duração padrão
        onVideoUploaded(videoUrl, 0);
        setIsUploading(false);
      };
      
      // Iniciar o carregamento dos metadados
      video.src = videoUrl;
      
    } catch (err: any) {
      console.error('Erro ao fazer upload:', err);
      setError(`Erro ao fazer upload: ${err.message || 'Erro desconhecido'}`);
      toast.error('Erro de upload', {
        description: 'Não foi possível enviar o vídeo. Tente novamente.'
      });
      setIsUploading(false);
    }
  };
  
  const handleCancelUpload = () => {
    // Aqui poderia ser implementada a lógica para cancelar o upload
    setIsUploading(false);
    setUploadProgress(0);
    toast.info('Upload cancelado');
  };
  
  const handleDeleteVideo = async () => {
    if (!videoInfo.url) return;
    
    try {
      await deleteMediaByUrl(videoInfo.url);
      setVideoInfo({ url: '', duration: 0, thumbnailUrl: '' });
      onVideoUploaded('', 0, '');
      toast.success('Vídeo removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover vídeo:', error);
      toast.error('Erro ao remover vídeo');
    }
  };
  
  const handleThumbnailUploaded = (url: string) => {
    setVideoInfo(prev => ({ ...prev, thumbnailUrl: url }));
    onVideoUploaded(videoInfo.url, videoInfo.duration, url);
    setEditingThumbnail(false);
    toast.success('Thumbnail atualizada com sucesso');
  };
  
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const openFileSelector = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {videoInfo.url ? (
        // Exibir o vídeo já carregado
        <div className="border rounded-md overflow-hidden">
          <AspectRatio ratio={16 / 9}>
            <video 
              ref={videoRef}
              src={videoInfo.url} 
              controls
              preload="metadata"
              poster={videoInfo.thumbnailUrl || undefined}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          
          <div className="p-3 bg-muted/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {content.title || 'Vídeo sem título'}
                </p>
              </div>
              
              {!disabled && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingThumbnail(!editingThumbnail)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Thumbnail
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteVideo}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              )}
            </div>
            
            {videoInfo.duration > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Duração: {formatDuration(videoInfo.duration)}</span>
              </div>
            )}
            
            {editingThumbnail && (
              <div className="mt-3 p-3 border rounded-md bg-background">
                <p className="text-sm font-medium mb-2">Personalizar Thumbnail</p>
                <ImageUploader
                  initialImageUrl={videoInfo.thumbnailUrl}
                  onImageUpload={handleThumbnailUploaded}
                  aspectRatio={16/9}
                  label=""
                  maxSizeMB={2}
                  customPath={`thumbnails/${user?.id}`}
                  placeholderText="Arraste uma imagem ou clique para selecionar"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        // Interface de upload
        <div 
          className={`border-2 border-dashed rounded-md p-6 text-center ${isUploading ? 'border-primary bg-primary/5' : 'border-border'} ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-muted/30'}`}
          onClick={openFileSelector}
        >
          {isUploading ? (
            // Estado de upload
            <div className="space-y-4">
              <div className="flex justify-center">
                <FileVideo className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Fazendo upload do vídeo...</p>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}%</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelUpload();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          ) : (
            // Estado padrão
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Clique para fazer upload do vídeo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP4, WebM ou MOV (máx. 100MB)
                </p>
              </div>
              <Button variant="secondary" size="sm" disabled={disabled}>
                <Upload className="h-4 w-4 mr-2" />
                Selecionar vídeo
              </Button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading || disabled}
          />
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default VideoUploader; 