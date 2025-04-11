import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, CreditCard, Bell, Lock, Upload, CheckCircle, 
  Folder, Award, Settings, BookOpen, Bookmark, Clock, Calendar, 
  Pencil, Heart, FileCheck, BarChart, ChevronRight, FileDown, PlusCircle,
  Loader
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useProfile, ProfileType } from '@/hooks/useProfile';

interface CourseData {
  id: string;
  title: string;
  instructor: string;
  image: string;
  progress?: number;
  lastAccessed?: string;
  nextLesson?: string;
  totalLessons?: number;
  completedLessons?: number;
  completedDate?: string;
  isCertificateIssued?: boolean;
  rating?: number;
  price?: number;
  isFree?: boolean;
  savingDate?: string;
}

interface CertificateData {
  id: string;
  title: string;
  issueDate: string;
  courseId: string;
  image: string;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState('meus-cursos');
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [inProgressCourses, setInProgressCourses] = useState<CourseData[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CourseData[]>([]);
  const [savedCourses, setSavedCourses] = useState<CourseData[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [notificationSettings, setNotificationSettings] = useState({
    courseUpdates: true,
    newMessages: true,
    promotions: false,
    newsletter: true,
    completionReminders: true,
  });
  
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      console.log("Fetching user data for:", user.id);
      
      try {
        const { data: inProgressData, error: inProgressError } = await supabase
          .from('enrollments')
          .select('*, course:courses(*)')
          .eq('user_id', user.id)
          .eq('completed', false);
        
        if (inProgressError) {
          console.error("Error fetching in-progress courses:", inProgressError);
          throw inProgressError;
        }
        console.log("In-progress courses:", inProgressData);
        
        const { data: completedData, error: completedError } = await supabase
          .from('enrollments')
          .select('*, course:courses(*)')
          .eq('user_id', user.id)
          .eq('completed', true);
        
        if (completedError) {
          console.error("Error fetching completed courses:", completedError);
          throw completedError;
        }
        console.log("Completed courses:", completedData);
        
        const savedData: any[] = [];
        
        const certificatesData: any[] = [];
        
        const formattedInProgress = inProgressData && inProgressData.length > 0 ? inProgressData.map((item) => ({
          id: item.course?.id || '',
          title: item.course?.title || 'Curso sem título',
          instructor: 'Instrutor',
          image: item.course?.image_url || 'https://via.placeholder.com/600x400',
          progress: item.progress || 0,
          lastAccessed: item.enrolled_at ? format(new Date(item.enrolled_at), 'dd/MM/yyyy') : '',
          nextLesson: 'Próxima aula',
          totalLessons: 10,
          completedLessons: Math.floor((item.progress || 0) * 10 / 100),
        })) : [];
        
        const formattedCompleted = completedData && completedData.length > 0 ? completedData.map((item) => ({
          id: item.course?.id || '',
          title: item.course?.title || 'Curso sem título',
          instructor: 'Instrutor',
          image: item.course?.image_url || 'https://via.placeholder.com/600x400',
          completedDate: item.enrolled_at ? format(new Date(item.enrolled_at), 'dd/MM/yyyy') : '',
          isCertificateIssued: false,
          rating: 5,
        })) : [];
        
        setInProgressCourses(formattedInProgress);
        setCompletedCourses(formattedCompleted);
        setSavedCourses([]);
        setCertificates([]);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados. Por favor, tente novamente mais tarde.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);
      
      const updates: Partial<ProfileType> = {
        name: editName,
      };
      
      const { error } = await updateProfile(updates);
      
      if (error) throw error;
      
      await refreshProfile();
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;
      
      setIsUpdating(true);
      
      await setupBucket('avatars', true, 5 * 1024 * 1024);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      await updateProfile({
        avatar_url: data.publicUrl
      });
      
      await refreshProfile();
      setAvatarUrl(data.publicUrl);
      
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso!"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar avatar",
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const userStats = {
    coursesInProgress: inProgressCourses.length,
    coursesCompleted: completedCourses.length,
    certificateCount: certificates.length,
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-brand-blue" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Acesso não autorizado</h2>
                <p className="text-muted-foreground mb-6">
                  Você precisa estar logado para acessar esta página.
                </p>
                <Button asChild>
                  <a href="/auth">Fazer login</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-brand-blue text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{profile?.name?.split(' ').map(n => n?.[0]).join('') || user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 cursor-pointer"
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUpdating}
                  />
                </label>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold">{profile?.name || 'Usuário'}</h1>
                <p className="text-white/80">{profile?.email || user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{userStats.coursesInProgress} cursos em andamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{userStats.coursesCompleted} cursos concluídos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>{userStats.certificateCount} certificados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div 
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${activeTab === 'meus-cursos' ? 'bg-muted' : ''}`}
                      onClick={() => setActiveTab('meus-cursos')}
                    >
                      <BookOpen className="h-5 w-5 text-brand-blue" />
                      <span className="font-medium">Meus Cursos</span>
                    </div>
                    <div 
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${activeTab === 'salvos' ? 'bg-muted' : ''}`}
                      onClick={() => setActiveTab('salvos')}
                    >
                      <Bookmark className="h-5 w-5 text-brand-blue" />
                      <span className="font-medium">Salvos</span>
                    </div>
                    <div 
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${activeTab === 'certificados' ? 'bg-muted' : ''}`}
                      onClick={() => setActiveTab('certificados')}
                    >
                      <Award className="h-5 w-5 text-brand-blue" />
                      <span className="font-medium">Certificados</span>
                    </div>
                    <div 
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${activeTab === 'configuracoes' ? 'bg-muted' : ''}`}
                      onClick={() => setActiveTab('configuracoes')}
                    >
                      <Settings className="h-5 w-5 text-brand-blue" />
                      <span className="font-medium">Configurações</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 space-y-8">
              {isLoading && (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                </div>
              )}
              
              {!isLoading && activeTab === 'meus-cursos' && (
                <div>
                  <Tabs defaultValue="em-andamento">
                    <TabsList className="mb-6">
                      <TabsTrigger value="em-andamento">Em Andamento</TabsTrigger>
                      <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="em-andamento" className="space-y-6">
                      {inProgressCourses.length === 0 ? (
                        <div className="text-center py-12 bg-muted rounded-lg">
                          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <h3 className="text-xl font-medium mb-2">Nenhum curso em andamento</h3>
                          <p className="text-muted-foreground mb-4">
                            Você não possui cursos em andamento no momento.
                          </p>
                          <Button>Explorar Cursos</Button>
                        </div>
                      ) : (
                        <>
                          {inProgressCourses.map((course) => (
                            <Card key={course.id} className="overflow-hidden">
                              <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/3 w-full h-48 md:h-auto">
                                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6 md:w-2/3 w-full">
                                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                                  <p className="text-sm text-muted-foreground">Instrutor: {course.instructor}</p>
                                  
                                  <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium">Progresso do curso</span>
                                      <span className="text-sm font-medium">{course.progress}%</span>
                                    </div>
                                    <Progress value={course.progress} className="h-2" />
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                                    <div className="flex items-start gap-2">
                                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                      <div>
                                        <p className="font-medium">Último acesso</p>
                                        <p className="text-muted-foreground">{course.lastAccessed}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                      <div>
                                        <p className="font-medium">Aulas concluídas</p>
                                        <p className="text-muted-foreground">{course.completedLessons} de {course.totalLessons}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-6 flex justify-between items-center">
                                    <div>
                                      <h4 className="text-sm font-medium">Próxima aula:</h4>
                                      <p className="text-sm text-muted-foreground">{course.nextLesson}</p>
                                    </div>
                                    <Button>Continuar</Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="concluidos" className="space-y-6">
                      {completedCourses.length === 0 ? (
                        <div className="text-center py-12 bg-muted rounded-lg">
                          <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <h3 className="text-xl font-medium mb-2">Nenhum curso concluído</h3>
                          <p className="text-muted-foreground mb-4">
                            Você ainda não concluiu nenhum curso na plataforma.
                          </p>
                          <Button>Explorar Cursos</Button>
                        </div>
                      ) : (
                        <>
                          {completedCourses.map((course) => (
                            <Card key={course.id} className="overflow-hidden">
                              <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/3 w-full h-48 md:h-auto">
                                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6 md:w-2/3 w-full">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                                      <p className="text-sm text-muted-foreground">Instrutor: {course.instructor}</p>
                                    </div>
                                    {course.isCertificateIssued && (
                                      <div className="flex-shrink-0">
                                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                                          <FileDown className="h-4 w-4" />
                                          <span>Certificado</span>
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-6 mt-4">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <div className="text-sm">
                                        <span className="font-medium">Concluído em:</span> {course.completedDate}
                                      </div>
                                    </div>
                                    
                                    {course.rating > 0 && (
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium mr-2">Sua avaliação:</span>
                                        <div className="flex items-center">
                                          {[...Array(5)].map((_, i) => (
                                            <svg
                                              key={i}
                                              className={`w-4 h-4 ${i < course.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="mt-6 flex justify-between items-center">
                                    <Button variant="outline">Ver detalhes</Button>
                                    
                                    {!course.isCertificateIssued && (
                                      <Button variant="secondary" size="sm" className="flex items-center gap-1">
                                        <Award className="h-4 w-4" />
                                        <span>Solicitar certificado</span>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {activeTab === 'salvos' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Cursos Salvos</h2>
                  
                  {savedCourses.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-xl font-medium mb-2">Nenhum curso salvo</h3>
                      <p className="text-muted-foreground mb-4">
                        Você ainda não salvou nenhum curso para ver mais tarde.
                      </p>
                      <Button>Explorar Cursos</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {savedCourses.map((course) => (
                        <Card key={course.id} className="overflow-hidden course-card">
                          <div className="relative">
                            <img 
                              src={course.image} 
                              alt={course.title}
                              className="w-full h-48 object-cover"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-rose-500 rounded-full z-10"
                            >
                              <Heart className="h-5 w-5 fill-rose-500" />
                            </Button>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {course.instructor}
                            </p>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs text-muted-foreground">
                                Salvo em {course.savingDate}
                              </span>
                              <span className="font-bold">
                                {course.isFree ? "Gratuito" : `R$ ${course.price?.toFixed(2) || '0.00'}`}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button className="flex-1">Ver Curso</Button>
                              <Button variant="outline" size="icon">
                                <Bookmark className="h-4 w-4 fill-current" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'certificados' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Meus Certificados</h2>
                  
                  {certificates.length === 0 ? (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-xl font-medium mb-2">Nenhum certificado ainda</h3>
                      <p className="text-muted-foreground mb-4">
                        Complete cursos para receber seus certificados.
                      </p>
                      <Button>Explorar Cursos</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {certificates.map((certificate) => (
                        <Card key={certificate.id} className="overflow-hidden">
                          <div className="relative">
                            <img 
                              src={certificate.image} 
                              alt={certificate.title}
                              className="w-full h-48 object-cover opacity-30"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white p-8 rounded-md flex items-center justify-center">
                                <Award className="h-16 w-16 text-brand-blue" />
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-1">{certificate.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Emitido em {certificate.issueDate}
                            </p>
                            <div className="flex gap-2">
                              <Button className="flex-1">
                                Ver Certificado
                              </Button>
                              <Button variant="outline" size="icon">
                                <FileDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'configuracoes' && !isLoading && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Configurações da Conta</h2>
                  
                  <Tabs defaultValue="perfil">
                    <TabsList className="mb-6">
                      <TabsTrigger value="perfil">Perfil</TabsTrigger>
                      <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
                      <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
                      <TabsTrigger value="seguranca">Segurança</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="perfil">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                              <div className="md:w-32 flex-shrink-0">
                                <Avatar className="w-32 h-32 mx-auto">
                                  <AvatarImage src={profile?.avatar_url || ''} />
                                  <AvatarFallback className="text-4xl">
                                    {profile?.name?.split(' ').map(n => n?.[0]).join('') || user?.email?.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-medium mb-2">Foto de Perfil</h3>
                                <p className="text-muted-foreground mb-4">
                                  Uma foto de perfil ajuda a personalizar sua conta e torna a experiência mais amigável.
                                </p>
                                <div className="flex gap-3">
                                  <label htmlFor="avatar-upload-settings" className="relative">
                                    <Button 
                                      disabled={isUpdating}
                                      className="cursor-pointer"
                                    >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Alterar Foto
                                    </Button>
                                    <input 
                                      id="avatar-upload-settings" 
                                      type="file" 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={handleAvatarUpload}
                                      disabled={isUpdating}
                                    />
                                  </label>
                                  <Button 
                                    variant="outline" 
                                    disabled={isUpdating || !profile?.avatar_url}
                                    onClick={async () => {
                                      try {
                                        setIsUpdating(true);
                                        await updateProfile({ avatar_url: null });
                                        await refreshProfile();
                                        setAvatarUrl(null);
                                        toast({
                                          title: "Foto removida",
                                          description: "Sua foto de perfil foi removida com sucesso."
                                        });
                                      } catch (error: any) {
                                        toast({
                                          variant: "destructive",
                                          title: "Erro ao remover foto",
                                          description: error.message
                                        });
                                      } finally {
                                        setIsUpdating(false);
                                      }
                                    }}
                                  >
                                    Remover
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="profile-name">Nome completo</Label>
                                <Input 
                                  id="profile-name" 
                                  value={editName} 
                                  onChange={(e) => setEditName(e.target.value)}
                                  disabled={isUpdating}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="profile-email">Email</Label>
                                <Input 
                                  id="profile-email" 
                                  value={profile?.email || user?.email || ''} 
                                  type="email" 
                                  disabled 
                                />
                              </div>
                            </div>
                            
                            <Button 
                              onClick={handleSaveProfile}
                              disabled={isUpdating}
                              className="relative"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                                  Salvando...
                                </>
                              ) : "Salvar Alterações"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="notificacoes">
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-medium mb-4">Preferências de Notificação</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Atualizações de Cursos</p>
                                <p className="text-sm text-muted-foreground">
                                  Receba notificações quando seus cursos forem atualizados
                                </p>
                              </div>
                              <Switch checked={notificationSettings.courseUpdates} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Novas Mensagens</p>
                                <p className="text-sm text-muted-foreground">
                                  Notificações de mensagens de instrutores e alunos
                                </p>
                              </div>
                              <Switch checked={notificationSettings.newMessages} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Promoções e Ofertas</p>
                                <p className="text-sm text-muted-foreground">
                                  Receba ofertas especiais e descontos em cursos
                                </p>
                              </div>
                              <Switch checked={notificationSettings.promotions} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Newsletter</p>
                                <p className="text-sm text-muted-foreground">
                                  Atualizações semanais sobre novos cursos e recursos
                                </p>
                              </div>
                              <Switch checked={notificationSettings.newsletter} />
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Lembretes de Conclusão</p>
                                <p className="text-sm text-muted-foreground">
                                  Receba lembretes para completar seus cursos
                                </p>
                              </div>
                              <Switch checked={notificationSettings.completionReminders} />
                            </div>
                          </div>
                          
                          <Button className="mt-6">Salvar Preferências</Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="pagamento">
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-medium mb-4">Métodos de Pagamento</h3>
                          
                          <div className="space-y-4 mb-6">
                            <div className="border rounded-md p-4 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="bg-muted p-2 rounded-md">
                                  <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                  <p className="font-medium">Cartão de Crédito</p>
                                  <p className="text-sm text-muted-foreground">
                                    •••• •••• •••• 4242 - Expira 12/25
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">Editar</Button>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  Remover
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <Button>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Adicionar Método de Pagamento
                          </Button>
                          
                          <div className="mt-8 pt-6 border-t">
                            <h3 className="text-lg font-medium mb-4">Histórico de Compras</h3>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                                <div>
                                  <p className="font-medium">React e TypeScript: desenvolvendo uma aplicação completa</p>
                                  <p className="text-sm text-muted-foreground">15/03/2024</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">R$ 149,99</p>
                                  <Button variant="link" size="sm" className="h-auto p-0">
                                    Ver Recibo
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                                <div>
                                  <p className="font-medium">Marketing Digital Avançado: Estratégias de Conversão</p>
                                  <p className="text-sm text-muted-foreground">20/02/2024</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">R$ 289,90</p>
                                  <Button variant="link" size="sm" className="h-auto p-0">
                                    Ver Recibo
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <Button variant="outline" className="mt-4 w-full">
                              Ver Histórico Completo
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="seguranca">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-8">
                            <div>
                              <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="current-password">Senha atual</Label>
                                  <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-password">Nova senha</Label>
                                  <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                                  <Input id="confirm-password" type="password" />
                                </div>
                                <Button>Atualizar Senha</Button>
                              </div>
                            </div>
                            
                            <div className="pt-6 border-t">
                              <h3 className="text-lg font-medium mb-4">Verificação em Duas Etapas</h3>
                              <p className="text-muted-foreground mb-4">
                                Adicione uma camada extra de segurança à sua conta com a verificação em duas etapas.
                              </p>
                              <Button>Configurar Verificação em Duas Etapas</Button>
                            </div>
                            
                            <div className="pt-6 border-t">
                              <h3 className="text-lg font-medium mb-4">Dispositivos Conectados</h3>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-background p-2 rounded-full">
                                      <Folder className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="font-medium">Windows PC - Chrome</p>
                                      <p className="text-xs text-muted-foreground">São Paulo, BR • Atualmente ativo</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    Encerrar
                                  </Button>
                                </div>
                                
                                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-background p-2 rounded-full">
                                      <Folder className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="font-medium">iPhone - Safari</p>
                                      <p className="text-xs text-muted-foreground">São Paulo, BR • 2 dias atrás</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    Encerrar
                                  </Button>
                                </div>
                              </div>
                              
                              <Button variant="outline" className="mt-4">
                                Encerrar Todas as Sessões
                              </Button>
                            </div>
                            
                            <div className="pt-6 border-t">
                              <h3 className="text-lg font-medium mb-4 text-destructive">Zona de Perigo</h3>
                              <p className="text-muted-foreground mb-4">
                                Cuidado! As ações abaixo são irreversíveis.
                              </p>
                              <Button variant="destructive">
                                Excluir Minha Conta
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
