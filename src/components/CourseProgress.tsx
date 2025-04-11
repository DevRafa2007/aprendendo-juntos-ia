import React, { useEffect, useState } from 'react';
import {
  Box,
  Progress,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  Flex,
  Icon,
  Badge,
  Heading,
  Skeleton,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, LockIcon } from '@chakra-ui/icons';
import { FaPlayCircle, FaFileAlt, FaQuestionCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'text' | 'document' | 'quiz';
  completed: boolean;
  locked?: boolean;
}

interface Module {
  id: string;
  title: string;
  contents: ContentItem[];
  completed: boolean;
  locked?: boolean;
}

interface CourseProgressProps {
  courseId: string;
  modules: Module[];
  isLoading?: boolean;
  onContentSelect?: (moduleId: string, contentId: string) => void;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({
  courseId,
  modules,
  isLoading = false,
  onContentSelect,
}) => {
  const [progressPercent, setProgressPercent] = useState(0);
  const { user } = useAuth();

  // Calcula a porcentagem total de progresso
  useEffect(() => {
    if (!modules || modules.length === 0) {
      setProgressPercent(0);
      return;
    }

    let totalContents = 0;
    let completedContents = 0;

    modules.forEach(module => {
      module.contents.forEach(content => {
        totalContents++;
        if (content.completed) {
          completedContents++;
        }
      });
    });

    const percent = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;
    setProgressPercent(percent);
  }, [modules]);

  // Renderiza o ícone apropriado para o tipo de conteúdo
  const renderContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Icon as={FaPlayCircle} color="blue.500" mr={2} />;
      case 'text':
        return <Icon as={FaFileAlt} color="green.500" mr={2} />;
      case 'document':
        return <Icon as={FaFileAlt} color="purple.500" mr={2} />;
      case 'quiz':
        return <Icon as={FaQuestionCircle} color="orange.500" mr={2} />;
      default:
        return <Icon as={FaFileAlt} color="gray.500" mr={2} />;
    }
  };

  if (isLoading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Skeleton height="20px" width="200px" mb={4} />
        <Skeleton height="20px" mb={2} />
        <Skeleton height="150px" mb={4} />
        <Skeleton height="20px" mb={2} />
        <Skeleton height="150px" />
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
      <Heading size="md" mb={4}>
        Seu progresso
      </Heading>
      
      <Flex align="center" mb={4}>
        <Progress
          value={progressPercent}
          size="md"
          colorScheme="blue"
          borderRadius="md"
          flex="1"
          mr={3}
        />
        <Text fontWeight="bold" width="50px" textAlign="right">
          {progressPercent}%
        </Text>
      </Flex>

      <Accordion allowMultiple defaultIndex={[0]}>
        {modules.map((module) => (
          <AccordionItem key={module.id}>
            <h2>
              <AccordionButton py={3}>
                <Box flex="1" textAlign="left" fontWeight="medium">
                  <Flex align="center">
                    {module.completed ? (
                      <CheckCircleIcon color="green.500" mr={2} />
                    ) : module.locked ? (
                      <LockIcon color="gray.500" mr={2} />
                    ) : (
                      <TimeIcon color="blue.500" mr={2} />
                    )}
                    {module.title}
                  </Flex>
                </Box>
                <Badge colorScheme={module.completed ? "green" : "blue"} mr={2}>
                  {getModuleProgressText(module)}
                </Badge>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <List spacing={2}>
                {module.contents.map((content) => (
                  <ListItem 
                    key={content.id} 
                    p={2} 
                    borderRadius="md"
                    bg={content.completed ? "green.50" : "white"}
                    _hover={{ 
                      bg: content.locked ? "gray.50" : "blue.50",
                      cursor: content.locked ? "not-allowed" : "pointer" 
                    }}
                    opacity={content.locked ? 0.7 : 1}
                    onClick={() => {
                      if (!content.locked && onContentSelect) {
                        onContentSelect(module.id, content.id);
                      }
                    }}
                  >
                    <Flex align="center" justify="space-between">
                      <Flex align="center">
                        {content.locked ? (
                          <LockIcon color="gray.500" mr={2} />
                        ) : (
                          renderContentIcon(content.type)
                        )}
                        <Text color={content.locked ? "gray.500" : "inherit"}>
                          {content.title}
                        </Text>
                      </Flex>
                      {content.completed && (
                        <CheckCircleIcon color="green.500" />
                      )}
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

// Função auxiliar para obter o texto de progresso do módulo
function getModuleProgressText(module: Module): string {
  if (module.locked) return "Bloqueado";
  if (module.completed) return "Concluído";
  
  const totalContents = module.contents.length;
  const completedContents = module.contents.filter(c => c.completed).length;
  
  return `${completedContents}/${totalContents}`;
} 