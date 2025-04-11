import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Button,
  Text,
  Heading,
  Icon,
  Progress,
  Spinner,
  useToast,
  VStack,
  HStack,
  IconButton,
  Link,
} from '@chakra-ui/react';
import { CheckIcon, DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFile } from 'react-icons/fa';
import { useProgress } from '../../contexts/ProgressContext';

// Configuração necessária para o react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentPlayerProps {
  title: string;
  documentUrl: string;
  documentType?: 'pdf' | 'doc' | 'xls' | 'ppt' | 'other';
  courseId: string;
  moduleId: string;
  contentId: string;
  onComplete?: () => void;
}

export const DocumentPlayer: React.FC<DocumentPlayerProps> = ({
  title,
  documentUrl,
  documentType = 'pdf',
  courseId,
  moduleId,
  contentId,
  onComplete,
}) => {
  // Estados
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewSeconds, setViewSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  
  // Hooks
  const toast = useToast();
  const { getContentProgress, updateContentProgress, markContentAsCompleted } = useProgress();
  
  // Determinar o ícone para o tipo de documento
  const getDocumentIcon = () => {
    switch (documentType) {
      case 'pdf':
        return FaFilePdf;
      case 'doc':
        return FaFileWord;
      case 'xls':
        return FaFileExcel;
      case 'ppt':
        return FaFilePowerpoint;
      default:
        return FaFile;
    }
  };
  
  // Carregar progresso salvo
  useEffect(() => {
    const loadSavedProgress = () => {
      const progress = getContentProgress(courseId, moduleId, contentId);
      
      if (progress) {
        setIsCompleted(progress.completed);
        if (progress.position > 0) {
          setCurrentPage(Math.max(1, Math.min(numPages || 1, Math.ceil(progress.position))));
        }
        setReadProgress(progress.position);
      }
    };
    
    if (numPages) {
      loadSavedProgress();
    }
  }, [courseId, moduleId, contentId, numPages, getContentProgress]);
  
  // Atualizar progresso quando a página mudar
  useEffect(() => {
    if (!numPages) return;
    
    const progress = (currentPage / numPages) * 100;
    setReadProgress(progress);
    
    // Considerar concluído se o usuário chegou à última página ou viu mais de 90% do documento
    if ((currentPage === numPages || progress > 90) && !isCompleted) {
      handleMarkAsCompleted();
    }
  }, [currentPage, numPages, isCompleted]);
  
  // Monitorar o tempo de visualização
  useEffect(() => {
    if (isCompleted) return;
    
    const interval = setInterval(() => {
      setViewSeconds(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isCompleted]);
  
  // Salvar progresso periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (numPages) {
        updateContentProgress(
          courseId,
          moduleId,
          contentId,
          readProgress,
          isCompleted
        );
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      
      // Salvar ao desmontar
      if (numPages) {
        updateContentProgress(
          courseId,
          moduleId,
          contentId,
          readProgress,
          isCompleted
        );
      }
    };
  }, [courseId, moduleId, contentId, readProgress, isCompleted, numPages, updateContentProgress]);
  
  // Callback quando o documento for carregado
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };
  
  // Callback quando houver erro no carregamento
  const onDocumentLoadError = (error: Error) => {
    console.error('Erro ao carregar documento:', error);
    setError('Não foi possível carregar o documento. Verifique sua conexão ou tente baixá-lo.');
    setIsLoading(false);
  };
  
  // Navegar para a próxima página
  const goToNextPage = () => {
    if (currentPage < (numPages || 1)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Navegar para a página anterior
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Marcar como concluído
  const handleMarkAsCompleted = async () => {
    if (isCompleted) return;
    
    try {
      await markContentAsCompleted(courseId, moduleId, contentId);
      setIsCompleted(true);
      
      toast({
        title: 'Documento concluído',
        description: 'Este documento foi marcado como concluído.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
    }
  };
  
  // Verificar se é possível renderizar o documento no navegador
  const canRenderInBrowser = documentType === 'pdf';
  
  // Renderizar o documento não-PDF
  const renderNonPdfDocument = () => {
    const Icon = getDocumentIcon();
    
    return (
      <Box 
        p={8} 
        textAlign="center" 
        borderWidth="1px" 
        borderRadius="lg"
        borderStyle="dashed"
      >
        <Icon size={60} color="#3182CE" />
        <Heading size="md" mt={4}>
          {title}
        </Heading>
        <Text mt={2} mb={6} color="gray.600">
          Este tipo de documento não pode ser visualizado diretamente no navegador.
        </Text>
        <HStack spacing={4} justify="center">
          <Button 
            leftIcon={<DownloadIcon />} 
            colorScheme="blue"
            as="a"
            href={documentUrl}
            download
          >
            Baixar documento
          </Button>
          <Button
            leftIcon={<ExternalLinkIcon />}
            as="a"
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir em nova aba
          </Button>
        </HStack>
      </Box>
    );
  };
  
  return (
    <Box borderWidth="1px" borderRadius="lg" p={5} bg="white" shadow="sm">
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading as="h2" size="md">
            {title}
          </Heading>
          
          <HStack spacing={2}>
            {isCompleted && (
              <Flex align="center" color="green.500">
                <Icon as={CheckIcon} mr={1} />
                <Text fontWeight="medium">Concluído</Text>
              </Flex>
            )}
            
            <IconButton
              aria-label="Baixar documento"
              icon={<DownloadIcon />}
              size="sm"
              as={Link}
              href={documentUrl}
              download
              isExternal
            />
          </HStack>
        </Flex>
        
        {canRenderInBrowser && (
          <Progress 
            value={readProgress} 
            colorScheme="blue" 
            size="sm" 
            borderRadius="full" 
          />
        )}
        
        {/* Conteúdo do documento */}
        <Box minH="500px" borderWidth="1px" borderRadius="md" overflow="hidden">
          {isLoading && canRenderInBrowser && (
            <Flex justify="center" align="center" h="500px">
              <Spinner size="xl" color="blue.500" />
              <Text ml={4}>Carregando documento...</Text>
            </Flex>
          )}
          
          {error && (
            <Flex direction="column" justify="center" align="center" h="500px" p={4}>
              <Text color="red.500" mb={4}>{error}</Text>
              <Button 
                leftIcon={<DownloadIcon />} 
                colorScheme="blue"
                as="a"
                href={documentUrl}
                download
              >
                Baixar documento
              </Button>
            </Flex>
          )}
          
          {!isLoading && !error && canRenderInBrowser ? (
            <Box p={4} textAlign="center">
              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<Spinner size="xl" color="blue.500" />}
              >
                <Page 
                  pageNumber={currentPage} 
                  width={Math.min(600, window.innerWidth - 80)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              
              {numPages && (
                <Text mt={2} color="gray.600">
                  Página {currentPage} de {numPages}
                </Text>
              )}
            </Box>
          ) : (
            !isLoading && !error && renderNonPdfDocument()
          )}
        </Box>
        
        {/* Controles de navegação para PDF */}
        {canRenderInBrowser && !error && !isLoading && (
          <Flex justify="space-between" align="center">
            <Button
              onClick={goToPrevPage}
              isDisabled={currentPage <= 1}
            >
              Página anterior
            </Button>
            
            <Button
              colorScheme={isCompleted ? "green" : "blue"}
              onClick={handleMarkAsCompleted}
              leftIcon={isCompleted ? <CheckIcon /> : undefined}
              isDisabled={isCompleted}
            >
              {isCompleted ? "Concluído" : "Marcar como concluído"}
            </Button>
            
            <Button
              onClick={goToNextPage}
              isDisabled={currentPage >= (numPages || 1)}
            >
              Próxima página
            </Button>
          </Flex>
        )}
        
        {/* Botão para marcar como concluído (para documentos não-PDF) */}
        {!canRenderInBrowser && !error && (
          <Flex justify="center" mt={4}>
            <Button
              colorScheme={isCompleted ? "green" : "blue"}
              onClick={handleMarkAsCompleted}
              leftIcon={isCompleted ? <CheckIcon /> : undefined}
              isDisabled={isCompleted}
            >
              {isCompleted ? "Concluído" : "Marcar como concluído"}
            </Button>
          </Flex>
        )}
      </VStack>
    </Box>
  );
}; 