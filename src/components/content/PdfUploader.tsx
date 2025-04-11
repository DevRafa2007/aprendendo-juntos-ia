import React, { useState, useRef, ChangeEvent } from 'react';
import { Box, Button, Text, VStack, Progress, HStack, useToast, Link, Icon } from '@chakra-ui/react';
import { FiUpload, FiDownload, FiFile, FiX } from 'react-icons/fi';
import { uploadDocument, deleteMediaByUrl } from '@/services/mediaService';
import { useAuth } from '@/contexts/AuthContext';

interface PdfUploaderProps {
  initialPdfUrl?: string;
  onPdfUploaded: (url: string) => void;
  onPdfRemoved?: () => void;
  label?: string;
  required?: boolean;
}

/**
 * Componente para upload e exibição de documentos PDF
 */
export const PdfUploader: React.FC<PdfUploaderProps> = ({
  initialPdfUrl,
  onPdfUploaded,
  onPdfRemoved,
  label = 'Material em PDF',
  required = false,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(initialPdfUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { user } = useAuth();
  
  // Extrai o nome do arquivo da URL
  const getFileNameFromUrl = (url: string): string => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const pathParts = decodedUrl.split('/');
      const fileName = pathParts[pathParts.length - 1].split('?')[0];
      return fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName;
    } catch (e) {
      return 'documento.pdf';
    }
  };
  
  // Manipula a seleção de arquivo
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    if (!file.type.includes('pdf')) {
      setError('Por favor, selecione apenas arquivos PDF.');
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Por favor, selecione apenas arquivos PDF.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validar tamanho do arquivo (10MB máximo)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError('O arquivo é muito grande. O tamanho máximo é 10MB.');
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo é muito grande. O tamanho máximo é 10MB.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const downloadUrl = await uploadDocument(file, user.uid, {
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        customPath: `course-materials/${user.uid}/${Date.now()}-${file.name}`
      });
      
      setPdfUrl(downloadUrl);
      onPdfUploaded(downloadUrl);
      
      toast({
        title: 'Upload concluído',
        description: 'Seu PDF foi carregado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      setError('Falha ao fazer upload do arquivo. Por favor, tente novamente.');
      toast({
        title: 'Erro no upload',
        description: 'Falha ao fazer upload do arquivo. Por favor, tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      // Limpar o input de arquivo para permitir o upload do mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Remove o PDF
  const handleRemovePdf = async () => {
    if (pdfUrl) {
      try {
        await deleteMediaByUrl(pdfUrl);
        setPdfUrl(undefined);
        if (onPdfRemoved) {
          onPdfRemoved();
        }
        
        toast({
          title: 'PDF removido',
          description: 'O PDF foi removido com sucesso.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Erro ao remover PDF:', error);
        toast({
          title: 'Erro ao remover',
          description: 'Não foi possível remover o PDF. Por favor, tente novamente.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };
  
  // Cancela o upload atual
  const handleCancelUpload = () => {
    // Nota: O Firebase não suporta cancelamento direto de uploads,
    // mas podemos parar de mostrar o progresso
    setUploading(false);
    setUploadProgress(0);
    // Para implementar cancelamento real, precisaríamos armazenar a referência da task
  };
  
  return (
    <Box width="100%">
      <Text mb={2} fontWeight="medium">
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Text>
      
      {pdfUrl ? (
        <VStack 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          alignItems="flex-start" 
          spacing={3}
          bg="gray.50"
        >
          <HStack width="100%" justifyContent="space-between">
            <HStack>
              <Icon as={FiFile} color="blue.500" boxSize={5} />
              <Text fontWeight="medium" color="blue.600">
                {getFileNameFromUrl(pdfUrl)}
              </Text>
            </HStack>
            <Button 
              size="sm" 
              colorScheme="red" 
              variant="ghost"
              leftIcon={<FiX />}
              onClick={handleRemovePdf}
            >
              Remover
            </Button>
          </HStack>
          
          <Button
            as={Link}
            href={pdfUrl}
            isExternal
            colorScheme="blue"
            variant="outline"
            size="sm"
            leftIcon={<FiDownload />}
            _hover={{ textDecoration: 'none' }}
          >
            Visualizar PDF
          </Button>
        </VStack>
      ) : (
        <VStack
          p={5}
          borderWidth="1px"
          borderRadius="md"
          borderStyle="dashed"
          spacing={4}
          align="center"
          justify="center"
          bg="gray.50"
        >
          {uploading ? (
            <VStack width="100%" spacing={3}>
              <Progress 
                value={uploadProgress} 
                size="sm" 
                width="100%" 
                colorScheme="blue" 
                borderRadius="md"
              />
              <HStack width="100%" justifyContent="space-between">
                <Text fontSize="sm">{uploadProgress.toFixed(0)}% completo</Text>
                <Button 
                  size="xs" 
                  colorScheme="red" 
                  variant="ghost"
                  onClick={handleCancelUpload}
                >
                  Cancelar
                </Button>
              </HStack>
            </VStack>
          ) : (
            <>
              <Icon as={FiUpload} boxSize={8} color="blue.500" />
              <VStack spacing={1}>
                <Text fontWeight="medium">Clique ou arraste para upload</Text>
                <Text fontSize="sm" color="gray.500">Apenas arquivos PDF (máx. 10MB)</Text>
              </VStack>
              {error && <Text color="red.500" fontSize="sm">{error}</Text>}
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isDisabled={uploading}
              >
                Selecionar PDF
              </Button>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
            </>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default PdfUploader; 