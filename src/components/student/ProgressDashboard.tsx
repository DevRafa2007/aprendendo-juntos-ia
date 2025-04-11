import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid, 
  Progress, 
  Card, 
  CardBody, 
  Stack, 
  Divider, 
  CardFooter, 
  Button, 
  Badge, 
  Flex, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatGroup, 
  Image, 
  useColorModeValue, 
  Skeleton
} from '@chakra-ui/react';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useContentProgress } from '@/hooks/useContentProgress';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

// Tipo para os cursos matriculados
interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  progress: number;
  last_access_date?: string;
  status: 'active' | 'completed' | 'paused' | 'canceled';
  enrollment_date: string;
  modules_count: number;
  content_count: number;
  completed_content_count: number;
}

export default function ProgressDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserEnrollments, loading, error } = useEnrollment();
  const { getCourseContentProgress } = useContentProgress();
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    fetchUserEnrollments();
  }, []);

  const fetchUserEnrollments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getUserEnrollments();
      
      if (data && Array.isArray(data.enrollments)) {
        // Processar dados e buscar progresso detalhado de cada curso
        const processedCourses = await Promise.all(
          data.enrollments.map(async (enrollment: any) => {
            // Buscar progresso detalhado do conteúdo
            const progressResult = await getCourseContentProgress(enrollment.course_id);
            const contentProgress = progressResult.data || { completed: 0, total: 0 };
            
            return {
              id: enrollment.course_id,
              title: enrollment.course?.title || 'Curso sem título',
              description: enrollment.course?.description || 'Sem descrição',
              cover_image: enrollment.course?.cover_image || '/images/default-course.jpg',
              progress: enrollment.progress || 0,
              last_access_date: enrollment.last_access_date,
              status: enrollment.status,
              enrollment_date: enrollment.enrollment_date,
              modules_count: enrollment.course?.modules_count || 0,
              content_count: contentProgress.total || 0,
              completed_content_count: contentProgress.completed || 0
            };
          })
        );
        
        setEnrolledCourses(processedCourses);
      }
    } catch (err) {
      console.error('Erro ao buscar matrículas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      active: { color: 'green', label: 'Ativo' },
      completed: { color: 'blue', label: 'Concluído' },
      paused: { color: 'yellow', label: 'Pausado' },
      canceled: { color: 'red', label: 'Cancelado' }
    };
    
    const statusInfo = statusMap[status] || { color: 'gray', label: status };
    
    return (
      <Badge colorScheme={statusInfo.color} fontSize="0.8em" px="2">
        {statusInfo.label}
      </Badge>
    );
  };

  const continueCourse = (courseId: string) => {
    router.push(`/learn/${courseId}`);
  };

  if (isLoading) {
    return (
      <Box p={5}>
        <Heading as="h1" size="xl" mb={6}>Meus Cursos</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="320px" borderRadius="lg" />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={6}>Meus Cursos</Heading>
      
      {/* Estatísticas */}
      <StatGroup 
        mb={8} 
        p={5} 
        borderRadius="md" 
        bg={statBg}
        boxShadow="md"
      >
        <Stat textAlign="center">
          <StatLabel>Cursos Ativos</StatLabel>
          <StatNumber>
            {enrolledCourses.filter(c => c.status === 'active').length}
          </StatNumber>
        </Stat>
        
        <Stat textAlign="center">
          <StatLabel>Cursos Concluídos</StatLabel>
          <StatNumber>
            {enrolledCourses.filter(c => c.status === 'completed').length}
          </StatNumber>
        </Stat>
        
        <Stat textAlign="center">
          <StatLabel>Progresso Geral</StatLabel>
          <StatNumber>
            {Math.round(
              enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / 
              (enrolledCourses.length || 1)
            )}%
          </StatNumber>
        </Stat>
      </StatGroup>
      
      {enrolledCourses.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Heading as="h3" size="md" mb={3}>Você ainda não está matriculado em nenhum curso</Heading>
          <Text mb={6}>Explore nossos cursos e comece sua jornada de aprendizado</Text>
          <Button 
            as={NextLink}
            href="/courses"
            colorScheme="blue"
          >
            Explorar Cursos
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {enrolledCourses.map((course) => (
            <Card 
              key={course.id} 
              overflow="hidden" 
              variant="outline" 
              bg={cardBg}
              boxShadow="lg"
              borderRadius="lg"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
            >
              <Image
                src={course.cover_image}
                alt={course.title}
                height="180px"
                objectFit="cover"
                fallbackSrc="/images/default-course.jpg"
              />
              
              <CardBody>
                <Flex justify="space-between" align="center" mb={3}>
                  <Heading size="md">{course.title}</Heading>
                  {getStatusBadge(course.status)}
                </Flex>
                
                <Text noOfLines={2} mb={4}>
                  {course.description}
                </Text>
                
                <Stack spacing={4}>
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text fontWeight="bold">Progresso:</Text>
                      <Text>{course.progress}%</Text>
                    </Flex>
                    <Progress 
                      value={course.progress} 
                      colorScheme="blue" 
                      borderRadius="full"
                      size="sm"
                    />
                  </Box>
                  
                  <Flex justify="space-between">
                    <Text fontSize="sm">Aulas concluídas:</Text>
                    <Text fontSize="sm">
                      {course.completed_content_count} / {course.content_count}
                    </Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text fontSize="sm">Último acesso:</Text>
                    <Text fontSize="sm">{formatDate(course.last_access_date)}</Text>
                  </Flex>
                </Stack>
              </CardBody>
              
              <Divider />
              
              <CardFooter>
                <Button 
                  colorScheme="blue" 
                  width="full"
                  onClick={() => continueCourse(course.id)}
                  isDisabled={course.status === 'canceled'}
                >
                  {course.status === 'completed' ? 'Revisar Curso' : 'Continuar Curso'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
} 