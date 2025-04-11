import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { uploadDocument, deleteMediaByUrl, getFileNameFromUrl } from '@/services/mediaService';
import { toast } from 'sonner';
import { Upload, X, Download, File, Trash, Paperclip } from 'lucide-react';

interface DocumentUploaderProps {
  initialDocumentUrl?: string;
  onDocumentUploaded: (url: string) => void;
  onDocumentRemoved?: () => void;
  label?: string;
  required?: boolean;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

/**
 * Componente para upload de documentos (PDF, DOCX, etc)
 */
const DocumentUploader = ({
  initialDocumentUrl = '',
  onDocumentUploaded,
  onDocumentRemoved,
  label = 'Upload de documento',
  required = false,
  maxSizeMB = 5,
  allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}: DocumentUploaderProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para controle do upload
  const [documentUrl, setDocumentUrl] = useState<string>(initialDocumentUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  
  /**
   * Manipula o evento de seleção de arquivo
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validação do tipo de arquivo
    if (!allowedTypes.includes(file.type)) {
      const fileTypes = allowedTypes.map(type => {
        if (type === 'application/pdf') return 'PDF';
        if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
        return type;
      }).join(', ');
      
      setError(`Tipo de arquivo não suportado. Tipos permitidos: ${fileTypes}`);
      toast.error('Tipo de arquivo não suportado', {
        description: `Apenas ${fileTypes} são permitidos`
      });
      return;
    }
    
    // Validação do tamanho do arquivo
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`O arquivo excede o tamanho máximo de ${maxSizeMB}MB`);
      toast.error('Arquivo muito grande', {
        description: `O arquivo excede o tamanho máximo de ${maxSizeMB}MB`
      });
      return;
    }
    
    // Inicia o upload
    setIsUploading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      if (!user?.uid) {
        throw new Error('Usuário não autenticado');
      }
      
      const url = await uploadDocument(file, user.uid, {
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      });
      
      setDocumentUrl(url);
      onDocumentUploaded(url);
      toast.success('Documento enviado', {
        description: 'Seu documento foi enviado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      setError('Erro ao fazer upload. Por favor, tente novamente.');
      toast.error('Erro no upload', {
        description: 'Não foi possível enviar o documento'
      });
    } finally {
      setIsUploading(false);
      // Limpa o valor do input para permitir o upload do mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  /**
   * Remove o documento
   */
  const handleRemoveDocument = useCallback(async () => {
    if (documentUrl) {
      try {
        await deleteMediaByUrl(documentUrl);
        setDocumentUrl('');
        if (onDocumentRemoved) {
          onDocumentRemoved();
        }
        toast.success('Documento removido', {
          description: 'O documento foi removido com sucesso'
        });
      } catch (error) {
        console.error('Erro ao remover documento:', error);
        toast.error('Erro ao remover', {
          description: 'Não foi possível remover o documento'
        });
      }
    }
  }, [documentUrl, onDocumentRemoved]);
  
  /**
   * Cancela o upload em andamento
   */
  const handleCancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    toast.info('Upload cancelado');
  };
  
  /**
   * Abre o seletor de arquivos
   */
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  /**
   * Renderiza o formato do arquivo como badge
   */
  const renderFileFormat = () => {
    if (!documentUrl) return null;
    
    const fileName = getFileNameFromUrl(documentUrl);
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <Badge variant="destructive">PDF</Badge>;
    } else if (extension === 'docx') {
      return <Badge variant="secondary">DOCX</Badge>;
    } else {
      return <Badge>Documento</Badge>;
    }
  };
  
  return (
    <div className="w-full">
      {/* Label do campo */}
      <div className="flex items-center mb-2">
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      </div>
      
      {/* Input oculto para seleção de arquivo */}
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        className="hidden"
      />
      
      {/* Interface de upload */}
      {!documentUrl ? (
        <div 
          className={`border-2 border-dashed rounded-md p-6 text-center transition-colors
            ${isUploading ? 'border-primary bg-primary/5' : 'border-input'}
            hover:border-primary hover:bg-primary/5`}
        >
          {isUploading ? (
            <div>
              <p className="mb-2">Enviando documento...</p>
              <Progress value={uploadProgress} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground mb-2">{Math.round(uploadProgress)}%</p>
              <Button size="sm" onClick={handleCancelUpload} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          ) : (
            <>
              <File className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="mb-2">Arraste seu documento ou clique para selecionar</p>
              <p className="text-sm text-muted-foreground mb-4">
                Formatos suportados: {allowedTypes.map(type => {
                  if (type === 'application/pdf') return 'PDF';
                  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
                  return type;
                }).join(', ')}
              </p>
              <Button 
                onClick={handleButtonClick}
                variant="outline"
                className="mx-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivo
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="h-6 w-6 text-primary mr-2" />
              <div>
                <p className="font-medium">{getFileNameFromUrl(documentUrl) || 'Documento'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {renderFileFormat()}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </a>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRemoveDocument}>
                <Trash className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default DocumentUploader; 