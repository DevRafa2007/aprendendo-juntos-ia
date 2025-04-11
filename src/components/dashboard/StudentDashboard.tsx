import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  SimpleGrid, 
  Progress, 
  Badge, 
  Icon,
  Stack,
  Button,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  HStack,
  Divider,
  VStack,
  Skeleton
} from '@chakra-ui/react';
import { FiBook, FiClock, FiAward, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollment, EnrollmentWithCourseDetails } from '@/hooks/useEnrollment';
import { useContentProgress } from '@/hooks/useContentProgress';
import CourseCard from '@/components/CourseCard';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatusBadge = ({ status }: { status: string }) => {
  let color;
  switch (status) {
    case 'active':
      color = 'green';
      break;
    case 'completed':
      color = 'blue';
      break;
    case 'paused':
      color = 'yellow';
      break;
    case 'cancelled':
      color = 'red';
      break;
    default:
      color = 'gray';
  }

  const statusMap: Record<string, string> = {
    active: 'Ativo',
    completed: 'Concluído',
    paused: 'Pausado',
    cancelled: 'Cancelado'
  };

  return (
    <Badge colorScheme={color} borderRadius="full" px="2">
      {statusMap[status] || status}
    </Badge>
  );
};

const EnrollmentCard = ({ enrollment, onContinue }: { 
  enrollment: EnrollmentWithCourseDetails,
  onContinue: (id: string) => void
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const lastAccessed = enrollment.last_accessed_at 
    ? formatDistanceToNow(new Date(enrollment.last_accessed_at), { locale: ptBR, addSuffix: true })
    : 'Nunca acessado';

  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      bg={cardBg}
      boxShadow="sm"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <Flex direction="column" height="100%">
        <Flex justify="space-between" mb={2}>
          <Heading as="h3" size="md" isTruncated>{enrollment.course.title}</Heading>
          <StatusBadge status={enrollment.status} />
        </Flex>
        
        <Text fontSize="sm" color="gray.500" mb={4} isTruncated>
          {enrollment.course.instructor_name}
        </Text>
        
        <Box mb={4}>
          <Text fontSize="sm" mb={1}>Progresso</Text>
          <Progress 
            value={enrollment.progress} 
            size="sm" 
            colorScheme={enrollment.progress >= 100 ? "green" : "blue"} 
            borderRadius="full"
          />
          <Text fontSize="xs" textAlign="right" mt={1}>{enrollment.progress}%</Text>
        </Box>
        
        <Flex fontSize="xs" mb={3} justify="space-between">
          <HStack>
            <Icon as={FiCalendar} />
            <Text>Matriculado: {new Date(enrollment.enrolled_at).toLocaleDateString('pt-BR')}</Text>
          </HStack>
          <HStack>
            <Icon as={FiClock} />
            <Text>Último acesso: {lastAccessed}</Text>
          </HStack>
        </Flex>
        
        <Flex mt="auto" justify="space-between" alignItems="center">
          <Badge colorScheme="purple">{enrollment.course.category}</Badge>
          <Button 
            size="sm" 
            colorScheme="blue" 
            onClick={() => onContinue(enrollment.course_id)}
          >
            Continuar
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

const StudentStats = ({ enrollments }: { enrollments: EnrollmentWithCourseDetails[] }) => {
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const activeCourses = enrollments.filter(e => e.status === 'active').length;
  
  const averageProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;
    
  const statBg = useColorModeValue('white', 'gray.800');
  
  return (
    <StatGroup>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} w="full">
        <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
          <Flex align="center">
            <Box color="blue.500" mr={2}>
              <Icon as={FiBook} boxSize={5} />
            </Box>
            <Box>
              <StatLabel>Cursos Totais</StatLabel>
              <StatNumber>{totalCourses}</StatNumber>
            </Box>
          </Flex>
        </Stat>
        
        <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
          <Flex align="center">
            <Box color="green.500" mr={2}>
              <Icon as={FiAward} boxSize={5} />
            </Box>
            <Box>
              <StatLabel>Cursos Concluídos</StatLabel>
              <StatNumber>{completedCourses}</StatNumber>
            </Box>
          </Flex>
        </Stat>
        
        <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
          <Flex align="center">
            <Box color="purple.500" mr={2}>
              <Icon as={FiClock} boxSize={5} />
            </Box>
            <Box>
              <StatLabel>Cursos Ativos</StatLabel>
              <StatNumber>{activeCourses}</StatNumber>
            </Box>
          </Flex>
        </Stat>
        
        <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
          <Flex align="center">
            <Box color="orange.500" mr={2}>
              <Icon as={FiBarChart2} boxSize={5} />
            </Box>
            <Box>
              <StatLabel>Progresso Médio</StatLabel>
              <StatNumber>{averageProgress}%</StatNumber>
            </Box>
          </Flex>
        </Stat>
      </SimpleGrid>
    </StatGroup>
  );
};

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourseDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { getUserEnrollments } = useEnrollment();
  const { getAllUserProgress } = useContentProgress();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const result = await getUserEnrollments();
        if (result.success && result.data) {
          setEnrollments(result.data);
        }
      } catch (error) {
        console.error('Erro ao buscar matrículas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user, getUserEnrollments]);

  const handleContinueCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  // Função para ordenar as matrículas (ativos primeiro, depois por progresso)
  const sortedEnrollments = [...enrollments].sort((a, b) => {
    // Primeiro por status (ativos primeiro)
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    
    // Depois por progresso (maior progresso primeiro)
    return b.progress - a.progress;
  });

  // Separando matrículas recentes (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentEnrollments = sortedEnrollments.filter(
    e => new Date(e.enrolled_at) >= thirtyDaysAgo
  );

  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={6}>Meu Dashboard de Aprendizado</Heading>
      
      {loading ? (
        <VStack spacing={4} align="stretch">
          <Skeleton height="100px" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Skeleton height="200px" />
            <Skeleton height="200px" />
            <Skeleton height="200px" />
          </SimpleGrid>
        </VStack>
      ) : (
        <>
          <Box mb={8}>
            <Heading as="h2" size="md" mb={4}>Estatísticas de Aprendizado</Heading>
            <StudentStats enrollments={enrollments} />
          </Box>
          
          {recentEnrollments.length > 0 && (
            <Box mb={8}>
              <Heading as="h2" size="md" mb={4}>Matrículas Recentes</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {recentEnrollments.map(enrollment => (
                  <EnrollmentCard 
                    key={enrollment.id} 
                    enrollment={enrollment} 
                    onContinue={handleContinueCourse} 
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}
          
          <Box mb={8}>
            <Heading as="h2" size="md" mb={4}>Todos os Meus Cursos</Heading>
            {enrollments.length === 0 ? (
              <Text>Você ainda não está matriculado em nenhum curso.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {sortedEnrollments.map(enrollment => (
                  <EnrollmentCard 
                    key={enrollment.id} 
                    enrollment={enrollment} 
                    onContinue={handleContinueCourse} 
                  />
                ))}
              </SimpleGrid>
            )}
          </Box>
        </>
      )}
    </Box>
  );
} 