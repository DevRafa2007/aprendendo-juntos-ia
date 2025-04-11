import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  Input,
  Flex,
  Image,
  Progress,
  useToast,
  IconButton,
  Spinner,
  AspectRatio
} from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadImage, deleteMediaByUrl } from '@/services/mediaService';
import { FiUpload, FiX, FiTrash, FiImage } from 'react-icons/fi';

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  label?: string;
  required?: boolean;
  aspectRatio?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

/**
 * Componente para upload e exibição de imagens
 */
export const ImageUploader = ({
  initialImageUrl = '',
  onImageUploaded,
  onImageRemoved,
  label = 'Upload de imagem',
  required = false,
  aspectRatio = 16 / 9,
  maxSizeMB = 2,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploaderProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para controle do upload
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [uploadTask, setUploadTask] = useState<any>(null);
  
  /**
   * Manipula o evento de seleção de arquivo
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validação do tipo de arquivo
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de arquivo não suportado. Tipos permitidos: ${allowedTypes.map(type => type.replace('image/', '')).join(', ')}`);
      return;
    }
    
    // Validação do tamanho do arquivo
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`A imagem excede o tamanho máximo de ${maxSizeMB}MB`);
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
      
      const task = uploadImage(file, user.uid, {
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      });
      
      setUploadTask(task);
      
      const url = await task;
      setImageUrl(url);
      onImageUploaded(url);
      toast({
        title: 'Imagem enviada',
        description: 'Sua imagem foi enviada com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setError('Erro ao fazer upload. Por favor, tente novamente.');
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar a imagem',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadTask(null);
      // Limpa o valor do input para permitir o upload da mesma imagem novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  /**
   * Remove a imagem
   */
  const handleRemoveImage = useCallback(async () => {
    if (imageUrl) {
      try {
        await deleteMediaByUrl(imageUrl);
        setImageUrl('');
        if (onImageRemoved) {
          onImageRemoved();
        }
        toast({
          title: 'Imagem removida',
          description: 'A imagem foi removida com sucesso',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Erro ao remover imagem:', error);
        toast({
          title: 'Erro ao remover',
          description: 'Não foi possível remover a imagem',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [imageUrl, onImageRemoved, toast]);
  
  /**
   * Cancela o upload em andamento
   */
  const handleCancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setIsUploading(false);
      setUploadProgress(0);
      setUploadTask(null);
      toast({
        title: 'Upload cancelado',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  /**
   * Abre o seletor de arquivos
   */
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <Box width="100%">
      {/* Label do campo */}
      <Flex align="center" mb={2}>
        <Text fontWeight="medium">
          {label} {required && <Text as="span" color="red.500">*</Text>}
        </Text>
      </Flex>
      
      {/* Input oculto para seleção de arquivo */}
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        hidden
      />
      
      {/* Interface de upload */}
      {!imageUrl ? (
        <AspectRatio ratio={aspectRatio} width="100%">
          <Box 
            border="2px dashed" 
            borderColor="gray.200" 
            borderRadius="md" 
            p={4}
            textAlign="center"
            transition="all 0.3s"
            _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
            onClick={handleButtonClick}
            cursor="pointer"
          >
            {isUploading ? (
              <Box>
                <Text mb={2}>Enviando imagem...</Text>
                <Progress value={uploadProgress} size="sm" colorScheme="blue" mb={2} />
                <Button size="sm" onClick={handleCancelUpload} leftIcon={<FiX />} colorScheme="red">
                  Cancelar
                </Button>
              </Box>
            ) : (
              <Flex direction="column" justify="center" align="center" h="100%">
                <Box as={FiImage} size="48px" color="gray.400" mb={2} />
                <Text mb={2}>Arraste sua imagem ou clique para selecionar</Text>
                <Text fontSize="sm" color="gray.500">
                  Formatos suportados: {allowedTypes.map(type => type.replace('image/', '')).join(', ')}
                </Text>
                {error && <Text color="red.500" mt={2} fontSize="sm">{error}</Text>}
              </Flex>
            )}
          </Box>
        </AspectRatio>
      ) : (
        <Box position="relative" borderRadius="md" overflow="hidden">
          {isImageLoading && (
            <Flex 
              position="absolute" 
              top="0" 
              left="0" 
              right="0" 
              bottom="0" 
              bg="blackAlpha.200" 
              zIndex="1"
              justify="center"
              align="center"
            >
              <Spinner size="xl" color="blue.500" />
            </Flex>
          )}
          
          <AspectRatio ratio={aspectRatio} width="100%">
            <Image 
              src={imageUrl} 
              alt="Imagem carregada" 
              objectFit="cover"
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setIsImageLoading(false);
                setError('Erro ao carregar a imagem');
              }}
            />
          </AspectRatio>
          
          <IconButton
            aria-label="Remover imagem"
            icon={<FiTrash />}
            position="absolute"
            top="2"
            right="2"
            colorScheme="red"
            size="sm"
            onClick={handleRemoveImage}
          />
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader; 