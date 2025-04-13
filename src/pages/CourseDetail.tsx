import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Award, User, FileText, Video, FileCheck, Lock, CheckCircle, BookOpen, Play, ArrowLeft, FileImage, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewList from '@/components/ReviewList';
import { useCourses } from '@/hooks/useCourses';
import { useCourseContent } from '@/hooks/useCourseContent';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import mediaService from '@/services/mediaService';

interface InstructorInfo {
  id: string;
  name: string;
  avatar_url: string | null;
  email: string;
}

interface Lesson {
  id: string;
  title: string;
  content_type: 'video' | 'text' | 'quiz';
  content_url?: string;
  description?: string;
  duration?: number;
  module_id: string;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  price: number;
  duration: number;
  level: string;
  category?: string;
  subject?: string;
  instructor_id: string;
  created_at: string;
  updated_at: string;
}

interface EnrollmentData {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  created_at: string;
  updated_at?: string;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { fetchCourseById } = useCourses();
  const { fetchCourseContent } = useCourseContent();
  const { enrollInCourse, checkEnrollment, updateProgress } = useEnrollment();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [courseContent, setCourseContent] = useState<Module[]>([]);
  const [instructor, setInstructor] = useState<InstructorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState({
    isEnrolled: false,
    progress: 0,
    completed: false,
    enrollmentData: null
  });
  const [activeTab, setActiveTab] = useState('conteudo');
  
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!courseId) return;
      
      setIsLoading(true);
      
      try {
        console.log('Tentando carregar curso:', courseId);
        
        const { data: courseData, error } = await fetchCourseById(courseId);
        
        if (error) {
          console.error('Erro ao buscar curso:', error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar o curso. Tente novamente."
          });
          navigate('/cursos');
          return;
        }
        
        if (!courseData) {
          console.log('Curso não encontrado:', courseId);
          toast({
            variant: "destructive",
            title: "Curso não encontrado",
            description: "O curso que você está procurando não existe ou foi removido."
          });
          navigate('/cursos');
          return;
        }
        
        console.log('Curso carregado com sucesso:', courseData);
        setCourse(courseData);
        
        const imageUrl = courseData?.image_url 
          ? mediaService.getCorrectMediaUrl(courseData.image_url) 
          : '/placeholder.svg';
        
        setCourse({
          ...courseData,
          image_url: imageUrl
        });
        
        try {
          const { data: contentData } = await fetchCourseContent(courseId);
          if (contentData) {
            setCourseContent(contentData);
          }
        } catch (contentError) {
          console.error('Erro ao carregar conteúdo do curso:', contentError);
          // Continua mesmo se o conteúdo falhar
        }
        
        setInstructor({
          id: courseData.instructor_id,
          name: 'Nome do Instrutor', // Substituir por busca real
          avatar_url: null,
          email: 'instrutor@exemplo.com' // Substituir por busca real
        });
        
        if (user) {
          try {
            const { isEnrolled, enrollmentData } = await checkEnrollment(courseId);
            
            setEnrollmentStatus({
              isEnrolled,
              progress: enrollmentData?.progress || 0,
              completed: enrollmentData?.completed || false,
              enrollmentData
            });
          } catch (enrollError) {
            console.error('Erro ao verificar inscrição:', enrollError);
            // Continua mesmo se a verificação de inscrição falhar
          }
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do curso:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao carregar os detalhes do curso."
        });
        navigate('/cursos');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourseDetails();
  }, [courseId, user]);
  
  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para se inscrever neste curso."
      });
      navigate('/login', { state: { returnTo: `/curso/${courseId}` } });
      return;
    }
    
    try {
      const { data, error, alreadyEnrolled } = await enrollInCourse(courseId!);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível completar sua inscrição. Tente novamente."
        });
        return;
      }
      
      if (!alreadyEnrolled) {
        setEnrollmentStatus({
          isEnrolled: true,
          progress: 0,
          completed: false,
          enrollmentData: data
        });
      }
    } catch (error) {
      console.error('Erro ao se inscrever no curso:', error);
    }
  };
  
  const handleUpdateProgress = async (progress: number, completed: boolean = false) => {
    if (!user || !enrollmentStatus.isEnrolled) return;
    
    try {
      const { data, error } = await updateProgress(courseId!, progress, completed);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível atualizar seu progresso."
        });
        return;
      }
      
      setEnrollmentStatus(prev => ({
        ...prev,
        progress,
        completed
      }));
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };
  
  const getTotalLessonsCount = () => {
    return courseContent.reduce((total, module) => total + module.lessons.length, 0);
  };
  
  const isInstructor = user && course && user.id === course.instructor_id;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Carregando detalhes do curso...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4">Curso não encontrado</p>
            <Button asChild>
              <Link to="/cursos">Voltar para Cursos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-r from-brand-blue to-brand-green text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-8">
              <Button variant="ghost" size="icon" asChild className="text-white mr-2">
                <Link to="/cursos">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {course.category && (
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                    {course.category}
                  </Badge>
                  )}
                  {course.subject && (
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                      {course.subject}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                    {course.level}
                  </Badge>
                </div>
              </div>
            </div>
            
            {enrollmentStatus.isEnrolled ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">
                      {enrollmentStatus.completed ? 'Curso completado!' : 'Progresso do curso'}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={enrollmentStatus.progress} className="w-48 h-2" />
                      <span className="text-sm">{enrollmentStatus.progress}%</span>
                    </div>
                  </div>
                  <Button variant="gradient" className="mt-2 md:mt-0">
                    {enrollmentStatus.completed ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Rever Conteúdo
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Continuar Aprendendo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                variant="gradient"
                size="lg" 
                onClick={handleEnroll}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Inscrever-se neste Curso
              </Button>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="conteudo">Conteúdo do Curso</TabsTrigger>
                  <TabsTrigger value="sobre">Sobre o Curso</TabsTrigger>
                  <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
                  <TabsTrigger value="instrutor">Instrutor</TabsTrigger>
                </TabsList>
                
                <TabsContent value="conteudo" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conteúdo do Curso</CardTitle>
                      <CardDescription>
                        {getTotalLessonsCount()} aulas • {course.duration} horas de conteúdo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {courseContent.length > 0 ? (
                          courseContent.map((module, index) => (
                            <AccordionItem key={module.id} value={`module-${module.id}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center text-left">
                                  <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm mr-3">
                                    {index + 1}
                                  </span>
                                  <div>
                                    <p className="font-medium">{module.title}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {module.lessons.length} aulas
                                    </p>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="pl-10 space-y-2 mt-2">
                                  {module.lessons.map((lesson, lessonIndex) => {
                                    const isLocked = !enrollmentStatus.isEnrolled && lessonIndex > 0;
                                    const icons = {
                                      video: <Video className="h-4 w-4" />,
                                      text: <FileText className="h-4 w-4" />,
                                      quiz: <FileCheck className="h-4 w-4" />,
                                    };
                                    
                                    return (
                                      <div key={lesson.id} className="border border-border rounded-md">
                                        <div className="flex items-center justify-between p-3">
                                          <div className="flex items-center gap-3">
                                            <div className="text-sm text-muted-foreground">
                                              {lessonIndex + 1}.
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {icons[lesson.content_type as keyof typeof icons]}
                                              <span>{lesson.title}</span>
                                            </div>
                                          </div>
                                          {isLocked ? (
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                          ) : (
                                            <Button variant="ghost" size="sm" className="h-8">
                                              {lesson.content_type === 'video' && <Play className="h-4 w-4" />}
                                              {lesson.content_type === 'text' && <FileText className="h-4 w-4" />}
                                              {lesson.content_type === 'quiz' && <FileCheck className="h-4 w-4" />}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))
                        ) : (
                          <div className="py-4 text-center text-muted-foreground">
                            <p>Ainda não há conteúdo disponível para este curso.</p>
                          </div>
                        )}
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sobre" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sobre o Curso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-lg">{course.description}</p>
                        
                        <h3 className="text-xl font-semibold mt-6 mb-4">O que você vai aprender</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                            <span>Competência 1 do curso</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                            <span>Competência 2 do curso</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                            <span>Competência 3 do curso</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                            <span>Competência 4 do curso</span>
                          </li>
                        </ul>
                        
                        <h3 className="text-xl font-semibold mt-6 mb-4">Pré-requisitos</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Nenhum conhecimento prévio necessário</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="avaliacoes" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Avaliações dos Alunos</CardTitle>
                      <CardDescription>
                        Veja o que os alunos estão dizendo sobre este curso
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {courseId && (
                        <ReviewList courseId={courseId} />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="instrutor" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sobre o Instrutor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={instructor?.avatar_url || ''} alt={instructor?.name} />
                          <AvatarFallback className="text-2xl">
                            {instructor?.name?.charAt(0) || 'I'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{instructor?.name}</h3>
                          <p className="text-muted-foreground mb-4">{instructor?.email}</p>
                          <p className="mb-4">
                            Biografia do instrutor não disponível.
                          </p>
                          <Button variant="outline">Ver perfil completo</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <div className="sticky top-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Detalhes do Curso</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="w-full h-40 overflow-hidden rounded-md mb-4 bg-muted/30 relative">
                      {course.image_url ? (
                        <img 
                          src={mediaService.getCorrectMediaUrl(course.image_url)} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Erro ao carregar imagem do curso:', course.image_url);
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Curso';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <FileImage className="h-12 w-12 mx-auto text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground mt-2">Sem imagem</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Duração:</span>
                        </div>
                        <span className="font-medium">{course.duration} horas</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex items-center text-sm">
                          <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Nível:</span>
                        </div>
                        <span className="font-medium capitalize">{course.level}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Instrutor:</span>
                        </div>
                        <span className="font-medium">{instructor?.name}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Criado em:</span>
                        </div>
                        <span className="font-medium">
                          {new Date(course.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      {course.price > 0 ? (
                        <div className="text-center">
                          <p className="text-lg font-semibold">R$ {course.price.toFixed(2)}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Badge variant="secondary" className="text-sm py-1 px-2">Gratuito</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {enrollmentStatus.isEnrolled ? (
                      <Button className="w-full">
                        {enrollmentStatus.completed ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Rever Conteúdo
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Continuar Aprendendo
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={handleEnroll}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Inscrever-se
                      </Button>
                    )}
                    
                    {isInstructor && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => navigate(`/editar-curso/${courseId}`)}
                      >
                        Editar este curso
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetail;
