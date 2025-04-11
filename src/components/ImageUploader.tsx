import { useState, useRef, useEffect } from 'react';
import { 
  Trash2 as TrashIcon, 
  Upload as UploadIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import useMediaUpload from '@/hooks/useMediaUpload';

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUpload?: (imageUrl: string) => void;
  onImageDelete?: () => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  aspectRatio?: number;
  width?: string;
  height?: string;
  label?: string;
  customPath?: string;
  isDisabled?: boolean;
  placeholderText?: string;
  borderRadius?: string;
}

const ImageUploader = ({
  initialImageUrl,
  onImageUpload,
  onImageDelete,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  aspectRatio = 16/9,
  width = '100%',
  height,
  label = 'Imagem',
  customPath,
  isDisabled = false,
  placeholderText = 'Arraste e solte sua imagem aqui ou clique para selecionar',
  borderRadius,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | undefined>(initialImageUrl);
  const [imageLoading, setImageLoading] = useState(false);
  
  const { 
    isUploading, 
    progress, 
    uploadFile, 
    deleteMedia, 
    error,
  } = useMediaUpload({
    maxSizeMB,
    allowedTypes,
    onSuccess: (url) => {
      setDisplayUrl(url);
      onImageUpload?.(url);
      toast.success('Imagem enviada com sucesso');
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
    },
    customPath,
  });

  // Atualiza a URL de exibição quando initialImageUrl muda
  useEffect(() => {
    if (initialImageUrl) {
      setDisplayUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  // Manipuladores de eventos
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDisabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isDisabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  const handleDeleteImage = async () => {
    if (isDisabled) return;
    
    if (displayUrl) {
      try {
        await deleteMedia();
        setDisplayUrl(undefined);
        onImageDelete?.();
        toast.success('Imagem removida');
      } catch (error) {
        toast.error('Erro ao remover imagem');
      }
    }
  };

  const openFileSelector = () => {
    if (!isDisabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Renderiza a visualização da imagem ou a área de drop
  const renderContent = () => {    
    if (isUploading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
          <div className="animate-spin">
            <UploadIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Enviando imagem...
          </p>
          <Progress value={progress} className="w-full h-2" />
          <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      );
    }
    
    if (displayUrl) {
      return (
        <div className="relative h-full w-full">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="animate-spin">
                <UploadIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          )}
          
          <img
            src={displayUrl}
            alt={label}
            className={cn(
              "object-cover w-full h-full",
              borderRadius && `rounded-${borderRadius}`
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {!isDisabled && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleDeleteImage}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <div 
        className="flex flex-col items-center justify-center h-full p-4 space-y-3"
        onClick={openFileSelector}
      >
        <UploadIcon className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-center text-muted-foreground">
          {placeholderText}
        </p>
        {error && (
          <p className="text-xs text-center text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={width} style={{ width }}>
      {label && <Label htmlFor="file-upload">{label}</Label>}
      
      <div
        className={cn(
          "relative mt-1.5 overflow-hidden",
          isDragging ? "border-primary bg-primary/5" : "border-input bg-background",
          "border-2 border-dashed transition-colors",
          borderRadius ? `rounded-${borderRadius}` : "rounded-md",
          isDisabled && "opacity-60 cursor-not-allowed"
        )}
        style={{ height }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AspectRatio ratio={aspectRatio}>
          {renderContent()}
        </AspectRatio>
        
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default ImageUploader; 