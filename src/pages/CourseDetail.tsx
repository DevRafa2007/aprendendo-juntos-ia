import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, Clock, Calendar, CheckCircle, Star, ThumbsUp, Award, 
  BarChart, Download, Share2, Heart, ShoppingCart, Video, 
  FileText, FileCheck, Users, MessageSquare, Scroll
} from 'lucide-react';

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Dados simulados do curso
  // Em uma aplicação real, estes dados viriam de uma API
  const course = {
    id: '1',
    title: 'React e TypeScript: desenvolvendo uma aplicação completa',
    instructor: 'Amanda Costa',
    instructorRole: 'Desenvolvedora Frontend Sênior',
    instructorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    category: 'Tecnologia',
    categorySlug: 'tecnologia',
    subcategory: 'Desenvolvimento Web',
    level: 'Intermediário',
    rating: 4.8,
    ratingCount: 347,
    studentsCount: 2843,
    lastUpdated: '12/03/2024',
    language: 'Português',
    duration: '40h',
    completionTime: '60 dias',
    price: 149.99,
    discount: 30,
    originalPrice: 199.99,
    isFree: false,
    image: 'https://picsum.photos/id/23/1200/600',
    description: `
      Desenvolva suas habilidades em React e TypeScript com este curso abrangente. Você vai aprender desde os fundamentos até técnicas avançadas, construindo uma aplicação completa do zero.
      
      Este curso é perfeito para desenvolvedores que já conhecem JavaScript e desejam melhorar suas habilidades com TypeScript e React, aprendendo as melhores práticas e padrões modernos.
    `,
    whatYouWillLearn: [
      'Dominar o React com TypeScript usando Hooks e Padrões Modernos',
      'Construir interfaces responsivas e acessíveis com TailwindCSS',
      'Implementar autenticação e integração com APIs RESTful',
      'Gerenciar estado global com Context API e Zustand',
      'Implementar testes automatizados com Jest e Testing Library',
      'Realizar deploy da aplicação em ambientes de produção',
      'Seguir as melhores práticas de desenvolvimento e performance',
      'Criar uma aplicação completa do início ao fim'
    ],
    requirements: [
      'Conhecimentos básicos de JavaScript',
      'Familiaridade com HTML e CSS',
      'Conhecimentos básicos de programação',
      'Computador com Node.js instalado'
    ],
    modules: [
      {
        id: 'm1',
        title: 'Introdução ao React e TypeScript',
        lessonsCount: 5,
        duration: '3h 20min',
        lessons: [
          { id: 'l1', title: 'Configurando o ambiente de desenvolvimento', type: 'video', duration: '15min', isCompleted: true },
          { id: 'l2', title: 'Fundamentos do TypeScript', type: 'video', duration: '45min', isCompleted: true },
          { id: 'l3', title: 'Introdução ao React com TypeScript', type: 'video', duration: '50min', isCompleted: false },
          { id: 'l4', title: 'Material complementar', type: 'text', duration: '10min', isCompleted: false },
          { id: 'l5', title: 'Quiz de fixação', type: 'quiz', duration: '20min', isCompleted: false },
        ]
      },
      {
        id: 'm2',
        title: 'Componentes e Props',
        lessonsCount: 4,
        duration: '4h 15min',
        lessons: [
          { id: 'l6', title: 'Criando componentes com TypeScript', type: 'video', duration: '55min', isCompleted: false },
          { id: 'l7', title: 'Tipagem de Props', type: 'video', duration: '40min', isCompleted: false },
          { id: 'l8', title: 'Exercícios práticos', type: 'text', duration: '30min', isCompleted: false },
          { id: 'l9', title: 'Componentização avançada', type: 'video', duration: '1h 10min', isCompleted: false },
        ]
      },
      {
        id: 'm3',
        title: 'Estados e Lifecycle',
        lessonsCount: 6,
        duration: '5h 30min',
        lessons: [
          { id: 'l10', title: 'UseState com TypeScript', type: 'video', duration: '45min', isCompleted: false },
          { id: 'l11', title: 'UseEffect e ciclo de vida', type: 'video', duration: '50min', isCompleted: false },
          { id: 'l12', title: 'Custom Hooks tipados', type: 'video', duration: '1h 05min', isCompleted: false },
          { id: 'l13', title: 'Exercícios - Hooks', type: 'text', duration: '30min', isCompleted: false },
          { id: 'l14', title: 'Estudo de caso: App de Tarefas', type: 'video', duration: '1h 20min', isCompleted: false },
          { id: 'l15', title: 'Quiz - Estados e Lifecycle', type: 'quiz', duration: '20min', isCompleted: false },
        ]
      },
      {
        id: 'm4',
        title: 'Integração com APIs',
        lessonsCount: 5,
        duration: '6h 45min',
        lessons: [
          { id: 'l16', title: 'Consumo de APIs com Fetch', type: 'video', duration: '45min', isCompleted: false },
          { id: 'l17', title: 'Axios e TypeScript', type: 'video', duration: '40min', isCompleted: false },
          { id: 'l18', title: 'React Query para gerenciamento de estado', type: 'video', duration: '1h 30min', isCompleted: false },
          { id: 'l19', title: 'Tratamento de erros tipado', type: 'video', duration: '55min', isCompleted: false },
          { id: 'l20', title: 'Projeto prático: Dashboard de dados', type: 'video', duration: '2h 15min', isCompleted: false },
        ]
      },
    ],
    reviews: [
      {
        id: 'r1',
        userName: 'Carlos Mendes',
        userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 5,
        date: '15/02/2024',
        comment: 'Excelente curso! Extremamente completo e didático. A Amanda explica os conceitos de forma clara e objetiva. Os projetos práticos ajudaram muito a fixar o conteúdo.'
      },
      {
        id: 'r2',
        userName: 'Juliana Silva',
        userAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        rating: 5,
        date: '03/02/2024',
        comment: 'Este curso superou minhas expectativas. Eu já conhecia React, mas o TypeScript sempre me intimidou. Agora me sinto confiante para utilizar em meus projetos!'
      },
      {
        id: 'r3',
        userName: 'Rafael Oliveira',
        userAvatar: 'https://randomuser.me/api/portraits/men/42.jpg',
        rating: 4,
        date: '28/01/2024',
        comment: 'Muito bom! Os conceitos são explicados com clareza e os exemplos são práticos. Só senti falta de mais conteúdo sobre testes, mas no geral é excelente.'
      },
    ],
    relatedCourses: [
      {
        id: 'rc1',
        title: 'Next.js: O framework React para produção',
        instructor: 'Marcos Paulo',
        image: 'https://picsum.photos/id/26/600/400',
        price: 179.99,
        rating: 4.7,
      },
      {
        id: 'rc2',
        title: 'Testes automatizados com Jest e React Testing Library',
        instructor: 'Fernanda Lima',
        image: 'https://picsum.photos/id/21/600/400',
        price: 89.99,
        rating: 4.5,
      },
      {
        id: 'rc3',
        title: 'Arquitetura de Software em React',
        instructor: 'Eduardo Santos',
        image: 'https://picsum.photos/id/28/600/400',
        price: 129.99,
        rating: 4.9,
      },
    ]
  };

  // Calcular progresso do curso
  const calculateProgress = () => {
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completedLessons = course.modules.reduce((acc, module) => {
      return acc + module.lessons.filter(lesson => lesson.isCompleted).length;
    }, 0);
    
    return Math.round((completedLessons / totalLessons) * 100);
  };

  // Renderizar estrelas de avaliação
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 fill-[50%]" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Cabeçalho do curso */}
        <section className="w-full bg-gradient-to-r from-brand-blue to-brand-green text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-white/20 hover:bg-white/30 border-none text-white">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="bg-white/20 hover:bg-white/30 border-none text-white">
                    {course.subcategory}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
                
                <p className="text-lg">{course.description.split('\n')[0]}</p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="flex">{renderStars(course.rating)}</div>
                    <span>({course.rating})</span>
                    <span className="text-white/80">({course.ratingCount} avaliações)</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.studentsCount} alunos</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration} de conteúdo</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Atualizado em {course.lastUpdated}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={course.instructorAvatar} />
                    <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{course.instructor}</p>
                    <p className="text-sm text-white/80">{course.instructorRole}</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-96 w-full">
                <Card className="shadow-xl">
                  <CardContent className="p-0 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6 space-y-6">
                      <div className="flex justify-between items-center">
                        {course.isFree ? (
                          <span className="text-2xl font-bold text-brand-green">Gratuito</span>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold">{`R$ ${course.price.toFixed(2)}`}</span>
                              {course.discount > 0 && (
                                <Badge className="bg-brand-green text-white">-{course.discount}%</Badge>
                              )}
                            </div>
                            {course.discount > 0 && (
                              <span className="text-sm text-muted-foreground line-through">
                                R$ {course.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                        <Button variant="ghost" size="icon">
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {isEnrolled ? (
                        <Button className="w-full gap-2" size="lg">
                          <Play className="h-5 w-5" />
                          Continuar Aprendendo
                        </Button>
                      ) : (
                        <Button className="w-full gap-2" size="lg">
                          <ShoppingCart className="h-5 w-5" />
                          {course.isFree ? 'Inscreva-se Gratuitamente' : 'Comprar Agora'}
                        </Button>
                      )}
                      
                      {!isEnrolled && !course.isFree && (
                        <p className="text-xs text-center text-muted-foreground">
                          Garantia de 30 dias ou seu dinheiro de volta
                        </p>
                      )}
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between text-sm">
                          <span>Nível:</span>
                          <span className="font-medium">{course.level}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Idioma:</span>
                          <span className="font-medium">{course.language}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Módulos:</span>
                          <span className="font-medium">{course.modules.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Conclusão:</span>
                          <span className="font-medium">{course.completionTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Se o aluno estiver matriculado, mostrar progresso */}
        {isEnrolled && (
          <div className="bg-muted py-4">
            <div className="container mx-auto px-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-blue text-white font-bold text-lg">
                    {calculateProgress()}%
                  </div>
                  <div className="flex-1 sm:w-64">
                    <p className="text-sm font-medium mb-1">Seu progresso</p>
                    <Progress value={calculateProgress()} className="h-2.5" />
                  </div>
                </div>
                <Button className="w-full sm:w-auto gap-2">
                  <Play className="h-4 w-4" />
                  Continuar de onde parou
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna de conteúdo */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="conteudo">
                <TabsList className="mb-6">
                  <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                  <TabsTrigger value="instrutor">Instrutor</TabsTrigger>
                  <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
                </TabsList>
                
                {/* Tab de Conteúdo */}
                <TabsContent value="conteudo" className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">O que você vai aprender</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Requisitos</h2>
                    <ul className="list-disc pl-5 space-y-2">
                      {course.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Descrição do curso</h2>
                    <div className="space-y-4">
                      {course.description.split('\n\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold">Conteúdo do curso</h2>
                      <div className="text-sm text-muted-foreground">
                        {course.modules.length} módulos • {
                          course.modules.reduce((acc, module) => acc + module.lessonsCount, 0)
                        } aulas • {course.duration} total
                      </div>
                    </div>
                    
                    <Accordion type="single" collapsible className="border rounded-lg">
                      {course.modules.map((module, moduleIndex) => (
                        <AccordionItem value={module.id} key={module.id}>
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left gap-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                                  {moduleIndex + 1}
                                </div>
                                <h3 className="font-medium">{module.title}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{module.lessonsCount} aulas</span>
                                <span>{module.duration}</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="ml-11 border-l pl-6 space-y-3">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div 
                                  key={lesson.id} 
                                  className={`flex items-center justify-between py-2 px-3 rounded-md ${isEnrolled ? 'hover:bg-muted cursor-pointer' : ''} ${lesson.isCompleted ? 'bg-muted/50' : ''}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-muted">
                                      {lessonIndex + 1}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {lesson.type === 'video' && <Video className="h-4 w-4 text-brand-blue" />}
                                      {lesson.type === 'text' && <FileText className="h-4 w-4 text-brand-green" />}
                                      {lesson.type === 'quiz' && <FileCheck className="h-4 w-4 text-brand-yellow" />}
                                      
                                      <span className={lesson.isCompleted ? 'line-through text-muted-foreground' : ''}>
                                        {lesson.title}
                                      </span>
                                      
                                      {lesson.isCompleted && (
                                        <CheckCircle className="h-4 w-4 text-brand-green" />
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="text-sm text-muted-foreground">
                                    {lesson.duration}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Certificado</h2>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                        <Scroll className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Certificado de Conclusão</h3>
                        <p className="text-sm text-muted-foreground">
                          Conclua todas as aulas para receber seu certificado de conclusão.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Cursos relacionados</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {course.relatedCourses.map((relatedCourse) => (
                        <Card key={relatedCourse.id} className="overflow-hidden">
                          <img 
                            src={relatedCourse.image} 
                            alt={relatedCourse.title}
                            className="h-32 w-full object-cover"
                          />
                          <CardContent className="p-4">
                            <h3 className="font-medium line-clamp-2 mb-1">{relatedCourse.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{relatedCourse.instructor}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1">
                                {renderStars(relatedCourse.rating)[0]}
                                <span className="text-sm">{relatedCourse.rating}</span>
                              </div>
                              <span className="font-medium">
                                R$ {relatedCourse.price.toFixed(2)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Tab do Instrutor */}
                <TabsContent value="instrutor" className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={course.instructorAvatar} />
                      <AvatarFallback className="text-xl">
                        {course.instructor.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{course.instructor}</h2>
                      <p className="text-muted-foreground">{course.instructorRole}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-brand-yellow" />
                      <span>Avaliação média de 4.8</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>582 avaliações</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span>9.827 alunos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      <span>7 cursos</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Sobre o instrutor</h3>
                    <p className="text-muted-foreground">
                      Amanda Costa é uma desenvolvedora frontend com mais de 8 anos de experiência em tecnologias web. 
                      Especialista em React e TypeScript, ela trabalhou em grandes empresas como XYZ Tech e ABC Solutions, 
                      onde liderou equipes de desenvolvimento frontend.
                    </p>
                    <p className="text-muted-foreground mt-3">
                      Além de sua experiência profissional, Amanda é palestrante em eventos de tecnologia e contribui 
                      ativamente para projetos open source. Sua abordagem prática de ensino e atenção aos detalhes a 
                      tornaram uma das instrutoras mais bem avaliadas da plataforma.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Outros cursos de {course.instructor}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="overflow-hidden">
                        <img 
                          src="https://picsum.photos/id/1/600/400" 
                          alt="JavaScript Moderno"
                          className="h-32 w-full object-cover"
                        />
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">JavaScript Moderno: Do Zero aos Projetos Avançados</h4>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              {renderStars(4.9)[0]}
                              <span className="text-sm">4.9</span>
                            </div>
                            <span className="font-medium">R$ 129,99</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="overflow-hidden">
                        <img 
                          src="https://picsum.photos/id/2/600/400" 
                          alt="CSS Avançado"
                          className="h-32 w-full object-cover"
                        />
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">CSS Avançado: Flexbox, Grid e Animações</h4>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              {renderStars(4.7)[0]}
                              <span className="text-sm">4.7</span>
                            </div>
                            <span className="font-medium">R$ 89,99</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Tab de Avaliações */}
                <TabsContent value="avaliacoes" className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 border rounded-lg">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-brand-blue">{course.rating}</div>
                      <div className="flex justify-center my-2">{renderStars(course.rating)}</div>
                      <div className="text-sm text-muted-foreground">Classificação do curso</div>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      {/* Barra para cada nota */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 text-right">5 ★</div>
                        <div className="flex-1">
                          <div className="bg-muted h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-yellow h-full rounded-full" style={{ width: "85%" }}></div>
                          </div>
                        </div>
                        <div className="w-10">85%</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 text-right">4 ★</div>
                        <div className="flex-1">
                          <div className="bg-muted h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-yellow h-full rounded-full" style={{ width: "10%" }}></div>
                          </div>
                        </div>
                        <div className="w-10">10%</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 text-right">3 ★</div>
                        <div className="flex-1">
                          <div className="bg-muted h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-yellow h-full rounded-full" style={{ width: "3%" }}></div>
                          </div>
                        </div>
                        <div className="w-10">3%</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 text-right">2 ★</div>
                        <div className="flex-1">
                          <div className="bg-muted h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-yellow h-full rounded-full" style={{ width: "1%" }}></div>
                          </div>
                        </div>
                        <div className="w-10">1%</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 text-right">1 ★</div>
                        <div className="flex-1">
                          <div className="bg-muted h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-yellow h-full rounded-full" style={{ width: "1%" }}></div>
                          </div>
                        </div>
                        <div className="w-10">1%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Comentários dos alunos</h3>
                    <div className="space-y-6">
                      {course.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarImage src={review.userAvatar} />
                              <AvatarFallback>{review.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{review.userName}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>Útil</span>
                            </Button>
                            <Button variant="ghost" size="sm">Reportar</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <Button variant
