import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Divider,
  useToast,
  Progress,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import ReactMarkdown from 'react-markdown';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { useProgress } from '../../contexts/ProgressContext';

interface TextPlayerProps {
  title: string;
  content: string;
  courseId: string;
  moduleId: string;
  contentId: string;
  estimatedReadTime?: number; // Em minutos
  onComplete?: () => void;
}

export const TextPlayer: React.FC<TextPlayerProps> = ({
  title,
  content,
  courseId,
  moduleId,
  contentId,
  estimatedReadTime,
  onComplete,
}) => {
  // Refs
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Estados
  const [readingProgress, setReadingProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0); // Em segundos
  
  // Hooks
  const toast = useToast();
  const { getContentProgress, updateContentProgress, markContentAsCompleted } = useProgress();
  
  // Carregar progresso salvo
  useEffect(() => {
    const loadSavedProgress = () => {
      const progress = getContentProgress(courseId, moduleId, contentId);
      
      if (progress) {
        setIsCompleted(progress.completed);
        setReadingProgress(Math.min(100, progress.position));
      }
    };
    
    loadSavedProgress();
  }, [courseId, moduleId, contentId, getContentProgress]);
  
  // Monitorar o progresso de leitura
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const contentElement = contentRef.current;
      const contentPosition = contentElement.getBoundingClientRect();
      
      // Verifica se o usuário passou pelo conteúdo
      if (contentPosition.bottom <= window.innerHeight && contentPosition.top >= 0) {
        // Usuário está vendo o conteúdo completo
        setReadingProgress(100);
      } else if (contentPosition.top < 0) {
        // Usuário rolou além do topo
        const visibleHeight = Math.min(contentPosition.bottom, window.innerHeight);
        const totalVisiblePercentage = (visibleHeight / contentElement.clientHeight) * 100;
        const scrollPercentage = Math.min(
          100,
          Math.max(0, (Math.abs(contentPosition.top) / (contentElement.clientHeight - window.innerHeight)) * 100)
        );
        
        setReadingProgress(Math.max(readingProgress, Math.round(scrollPercentage)));
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [readingProgress]);
  
  // Monitorar o tempo gasto na leitura
  useEffect(() => {
    let interval: number | null = null;
    
    if (!isCompleted) {
      interval = window.setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCompleted]);
  
  // Salvar progresso a cada 10 segundos
  useEffect(() => {
    const saveInterval = window.setInterval(() => {
      updateContentProgress(
        courseId,
        moduleId,
        contentId,
        readingProgress,
        isCompleted
      );
    }, 10000);
    
    return () => {
      clearInterval(saveInterval);
      
      // Salvar ao desmontar
      updateContentProgress(
        courseId,
        moduleId,
        contentId,
        readingProgress,
        isCompleted
      );
    };
  }, [courseId, moduleId, contentId, readingProgress, isCompleted, updateContentProgress]);
  
  // Verificar se o texto foi lido completamente
  useEffect(() => {
    const checkCompletion = () => {
      // Considerar completo se o usuário leu pelo menos 90% do conteúdo
      if (readingProgress >= 90 && !isCompleted) {
        handleMarkAsCompleted();
      }
    };
    
    checkCompletion();
  }, [readingProgress, isCompleted]);
  
  // Marcar como concluído
  const handleMarkAsCompleted = async () => {
    if (isCompleted) return;
    
    try {
      await markContentAsCompleted(courseId, moduleId, contentId);
      setIsCompleted(true);
      
      toast({
        title: 'Conteúdo concluído',
        description: 'Este conteúdo foi marcado como concluído.',
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
  
  // Formatar o tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  // Tempo estimado restante
  const estimatedTimeLeft = () => {
    if (!estimatedReadTime) return null;
    
    const totalEstimatedSeconds = estimatedReadTime * 60;
    const remainingSeconds = Math.max(0, totalEstimatedSeconds - timeSpent);
    
    if (remainingSeconds === 0 || readingProgress >= 100) {
      return null;
    }
    
    return formatTime(remainingSeconds);
  };
  
  return (
    <Box borderWidth="1px" borderRadius="lg" p={5} bg="white" shadow="sm">
      <VStack spacing={4} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading as="h2" size="lg">
            {title}
          </Heading>
          
          <HStack spacing={2}>
            {isCompleted && (
              <Flex align="center" color="green.500">
                <Icon as={CheckIcon} mr={1} />
                <Text fontWeight="medium">Concluído</Text>
              </Flex>
            )}
            
            {estimatedReadTime && !isCompleted && (
              <Text color="gray.600" fontSize="sm">
                Tempo estimado: {estimatedReadTime} min
              </Text>
            )}
          </HStack>
        </Flex>
        
        <Progress 
          value={readingProgress} 
          colorScheme="blue" 
          size="sm" 
          borderRadius="full"
        />
        
        <Divider />
        
        <Box ref={contentRef} className="markdown-content">
          <ReactMarkdown components={ChakraUIRenderer()}>
            {content}
          </ReactMarkdown>
        </Box>
        
        <Divider />
        
        <Flex justify="space-between" align="center">
          <Flex>
            {!isCompleted && estimatedTimeLeft() && (
              <Text fontSize="sm" color="gray.600">
                Tempo restante estimado: {estimatedTimeLeft()}
              </Text>
            )}
          </Flex>
          
          <Button
            colorScheme={isCompleted ? "green" : "blue"}
            onClick={handleMarkAsCompleted}
            leftIcon={isCompleted ? <CheckIcon /> : undefined}
            isDisabled={isCompleted}
          >
            {isCompleted ? "Concluído" : "Marcar como concluído"}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}; 