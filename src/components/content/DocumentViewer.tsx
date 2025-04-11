import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  VStack,
  HStack,
  Flex,
  IconButton,
  Tooltip,
  Skeleton,
  useToast
} from '@chakra-ui/react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaArrowLeft, FaArrowRight, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import { useContentProgress } from '@/hooks/useContentProgress';

// Configuração do worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  documentUrl: string;
  title?: string;
  courseId: string;
  moduleId: string;
  contentId: string;
  initialPage?: number;
  onComplete?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  title,
  courseId,
  moduleId,
  contentId,
  initialPage = 1,
  onComplete,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const toast = useToast();

  const { markContentAsCompleted } = useContentProgress();

  useEffect(() => {
    // Ajustar largura do documento com base no contêiner
    if (containerRef) {
      const updateWidth = () => {
        const width = containerRef.clientWidth;
        setPageWidth(Math.min(width - 40, 800)); // -40 para margem interna
      };

      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [containerRef]);

  useEffect(() => {
    // Marcar documento como completo quando usuário percorrer pelo menos 80% das páginas
    if (numPages && pageNumber >= Math.floor(numPages * 0.8)) {
      handleMarkAsComplete();
    }
  }, [pageNumber, numPages]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handlePageChange = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  };

  const handleMarkAsComplete = async () => {
    if (contentId) {
      try {
        const result = await markContentAsCompleted(courseId, moduleId, contentId);
        if (result.success && onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error('Erro ao marcar documento como concluído:', error);
      }
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && containerRef) {
      containerRef.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch(err => {
          toast({
            title: 'Erro ao entrar em tela cheia',
            description: err.message,
            status: 'error',
            duration: 3000,
          });
        });
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
        .then(() => setIsFullScreen(false))
        .catch(err => {
          toast({
            title: 'Erro ao sair da tela cheia',
            description: err.message,
            status: 'error',
            duration: 3000,
          });
        });
    }
  };

  const handleDownload = () => {
    // Criar um link para download e clicar nele programaticamente
    const link = document.createElement('a');
    link.href = documentUrl;
    link.setAttribute('download', title || 'documento.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box 
      border="1px solid" 
      borderColor="gray.200" 
      borderRadius="md" 
      overflow="hidden" 
      maxW="100%"
      ref={setContainerRef}
    >
      {title && (
        <Box p={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
          <Text fontWeight="bold" fontSize="lg">{title}</Text>
        </Box>
      )}

      <Box p={4}>
        {error ? (
          <VStack spacing={4} align="center" justify="center" minH="400px">
            <Text color="red.500">Erro ao carregar o documento: {error}</Text>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </VStack>
        ) : (
          <VStack spacing={4} align="center">
            <Document
              file={documentUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error('Erro ao carregar documento:', error);
                setError('Não foi possível carregar o documento.');
                setLoading(false);
              }}
              loading={
                <Skeleton height="600px" width={pageWidth} />
              }
            >
              {loading ? (
                <Skeleton height="600px" width={pageWidth} />
              ) : (
                <Page 
                  pageNumber={pageNumber} 
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              )}
            </Document>

            <HStack spacing={6} w="100%" justify="center">
              <Flex align="center" justify="center">
                <IconButton
                  aria-label="Página anterior"
                  icon={<FaArrowLeft />}
                  onClick={() => handlePageChange(-1)}
                  isDisabled={pageNumber <= 1 || loading}
                  mr={2}
                />
                <Text>
                  Página {pageNumber} de {numPages || '-'}
                </Text>
                <IconButton
                  aria-label="Próxima página"
                  icon={<FaArrowRight />}
                  onClick={() => handlePageChange(1)}
                  isDisabled={!numPages || pageNumber >= numPages || loading}
                  ml={2}
                />
              </Flex>

              <HStack>
                <Tooltip label="Download" placement="top">
                  <IconButton
                    aria-label="Download"
                    icon={<FaDownload />}
                    onClick={handleDownload}
                    isDisabled={loading}
                  />
                </Tooltip>
                <Tooltip label={isFullScreen ? "Sair da tela cheia" : "Tela cheia"} placement="top">
                  <IconButton
                    aria-label={isFullScreen ? "Sair da tela cheia" : "Tela cheia"}
                    icon={isFullScreen ? <FaCompress /> : <FaExpand />}
                    onClick={toggleFullScreen}
                    isDisabled={loading}
                  />
                </Tooltip>
              </HStack>
            </HStack>
          </VStack>
        )}
      </Box>
    </Box>
  );
}; 