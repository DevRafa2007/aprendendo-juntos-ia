
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Upload, Video, FileText, Image, 
  Clock, Calendar, Trash2, CheckCircle, Info, 
  HelpCircle, ArrowRight, FileCheck, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CourseFormData, useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

// Schema de validação para o formulário de curso
const courseSchema = z.object({
  title: z.string().min(5, { message: 'O título deve ter pelo menos 5 caracteres' }),
  description: z.string().min(20, { message: 'A descrição deve ter pelo menos 20 caracteres' }),
  category: z.string({ required_error: 'Selecione uma categoria' }),
  duration: z.number().min(1, { message: 'A duração deve ser pelo menos 1 hora' }).or(z.string().transform(val => parseInt(val))),
  level: z.string({ required_error: 'Selecione um nível' }),
  price: z.number().min(0, { message: 'O preço não pode ser negativo' }).or(z.string().transform(val => parseInt(val))),
  image_url: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

const CreateCourse = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createCourse, isLoading } = useCourses();
  const [activeTab, setActiveTab] = useState('informacoes');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [modules, setModules] = useState([
    { id: 1, title: 'Introdução ao Curso', contents: [
      { id: 1, type: 'video', title: 'Boas-vindas e Visão Geral' },
      { id: 2, type: 'text', title: 'Material de Apoio' },
      { id: 3, type: 'video', title: 'Como Aproveitar ao Máximo o Curso' },
    ]},
    { id: 2, title: 'Conceitos Fundamentais', contents: [
      { id: 1, type: 'video', title: 'Fundamentos Teóricos' },
      { id: 2, type: 'video', title: 'Aplicações Práticas' },
      { id: 3, type: 'text', title: 'Leitura Complementar' },
      { id: 4, type: 'video', title: 'Estudo de Caso' },
      { id: 5, type: 'quiz', title: 'Quiz de Fixação' },
    ]}
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      duration: 0,
      level: 'iniciante',
      price: 0,
      image_url: '',
    },
  });

  // Funções de manipulação
  const handleAddModule = () => {
    const newId = modules.length > 0 ? Math.max(...modules.map(m => m.id)) + 1 : 1;
    
    setModules([
      ...modules,
      { id: newId, title: `Novo Módulo ${newId}`, contents: [] }
    ]);
  };

  const handleUpdateModuleTitle = (moduleId: number, newTitle: string) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, title: newTitle } : module
    ));
  };

  const handleAddContent = (moduleIndex: number, contentType: 'video' | 'text' | 'quiz') => {
    const module = modules[moduleIndex];
    if (!module) return;
    
    const newId = module.contents.length > 0 
      ? Math.max(...module.contents.map(c => c.id)) + 1 
      : 1;
    
    const contentTitles = {
      video: 'Novo Vídeo',
      text: 'Novo Material de Texto',
      quiz: 'Novo Quiz',
    };
    
    const updatedModules = [...modules];
    updatedModules[moduleIndex].contents.push({
      id: newId,
      type: contentType,
      title: contentTitles[contentType]
    });
    
    setModules(updatedModules);
  };

  const handleDeleteContent = (moduleIndex: number, contentId: number) => {
    const updatedModules = [...modules];
    const moduleContents = updatedModules[moduleIndex].contents;
    
    updatedModules[moduleIndex].contents = moduleContents.filter(
      content => content.id !== contentId
    );
    
    setModules(updatedModules);
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    
    try {
      setUploading(true);
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `course-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, imageFile);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values: CourseFormValues) => {
    try {
      let imageUrl = values.image_url;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      // Preparar dados do curso para envio
      const courseData: CourseFormData = {
        ...values,
        image_url: imageUrl || null,
      };
      
      // Criar curso no banco de dados
      const { data, error } = await createCourse(courseData);
      
      if (error) throw error;
      
      // Redirecionar para a página do curso
      if (data?.id) {
        navigate(`/curso/${data.id}`);
      }
    } catch (error) {
      console.error('Erro ao publicar curso:', error);
    }
  };

  // Componente para exibir um item de conteúdo do curso
  const ContentItem = ({ type, title, index, moduleIndex, contentId }: { 
    type: 'video' | 'text' | 'quiz',
    title: string, 
    index: number,
    moduleIndex: number,
    contentId: number
  }) => {
    const icons = {
      video: <Video className="h-4 w-4" />,
      text: <FileText className="h-4 w-4" />,
      quiz: <FileCheck className="h-4 w-4" />,
    };

    return (
      <div className="flex items-center justify-between p-3 bg-card border border-border rounded-md mb-2 group">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center bg-muted rounded-full text-xs">
            {index}
          </div>
          <div className="flex items-center gap-2">
            {icons[type]}
            <span className="font-medium">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleDeleteContent(moduleIndex, contentId)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Cabeçalho */}
        <section className="bg-brand-green text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Crie Seu Curso</h1>
            <p className="text-lg max-w-2xl">
              Compartilhe seu conhecimento e ajude alunos em todo o Brasil a desenvolverem novas habilidades.
            </p>
          </div>
        </section>

        {/* Conteúdo principal */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna principal - formulário de criação */}
            <div className="lg:col-span-2">
              {/* Tabs para navegação entre etapas */}
              <Tabs defaultValue="informacoes" className="mb-8" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="informacoes" className="relative">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        1
                      </div>
                      <span className="hidden sm:block">Informações</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="conteudo" className="relative">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                        2
                      </div>
                      <span className="hidden sm:block">Conteúdo</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="precos" className="relative">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                        3
                      </div>
                      <span className="hidden sm:block">Preços & Publicação</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                {/* Tab de Informações Básicas */}
                <TabsContent value="informacoes" className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <Form {...form}>
                        <form className="space-y-6">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título do Curso*</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: Marketing Digital para Iniciantes" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  Escolha um título claro e atrativo que descreva bem o conteúdo do curso.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição do Curso*</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Descreva detalhadamente o que os alunos aprenderão no seu curso..."
                                    className="min-h-32"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Seja específico sobre o que será abordado, os objetivos de aprendizado e para quem o curso é indicado.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Categoria Principal*</FormLabel>
                                <Select 
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                                    <SelectItem value="negocios">Negócios</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="educacao">Educação</SelectItem>
                                    <SelectItem value="saude">Saúde e Bem-Estar</SelectItem>
                                    <SelectItem value="desenvolvimento-pessoal">Desenvolvimento Pessoal</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div>
                            <FormLabel className="mb-2 block">Imagem de Capa do Curso*</FormLabel>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                              {imagePreview ? (
                                <div className="mb-4">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="mx-auto max-h-40 object-cover rounded-lg"
                                  />
                                </div>
                              ) : (
                                <div className="mx-auto w-32 h-32 bg-muted mb-4 rounded-lg flex items-center justify-center">
                                  <Image className="w-12 h-12 text-muted-foreground" />
                                </div>
                              )}
                              <p className="text-sm text-muted-foreground mb-3">
                                Arraste uma imagem para cá ou clique para fazer upload
                              </p>
                              <Button
                                type="button"
                                onClick={() => document.getElementById('course-image')?.click()}
                                disabled={uploading}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? 'Enviando...' : 'Escolher Imagem'}
                              </Button>
                              <input
                                type="file"
                                id="course-image"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                                disabled={uploading}
                              />
                              <p className="text-xs text-muted-foreground mt-3">
                                Recomendamos imagens de pelo menos 1280x720 pixels, no formato JPG ou PNG.
                              </p>
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duração Estimada do Curso (horas)*</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 10"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Esta informação ajuda os alunos a planejarem seus estudos.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="level"
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Nível do Curso*</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                  >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="iniciante" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Iniciante
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="intermediario" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Intermediário
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="avancado" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Avançado
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="todos" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        Todos os níveis
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end">
                            <Button 
                              type="button"
                              size="lg" 
                              onClick={() => setActiveTab('conteudo')}
                              className="gap-2"
                            >
                              Próxima Etapa
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab de Conteúdo do Curso */}
                <TabsContent value="conteudo" className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Conteúdo do Curso</h2>
                        <Button onClick={handleAddModule}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Módulo
                        </Button>
                      </div>

                      <Alert className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Dica para criadores</AlertTitle>
                        <AlertDescription>
                          Organize seu curso em módulos para uma melhor experiência de aprendizado. Cada módulo deve cobrir um tema específico.
                        </AlertDescription>
                      </Alert>

                      <Accordion type="single" collapsible className="mb-6">
                        {modules.map((module, moduleIndex) => (
                          <AccordionItem key={module.id} value={`module-${module.id}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center">
                                  {moduleIndex + 1}
                                </div>
                                <div className="text-left">
                                  <p className="font-medium">{module.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {module.contents.length} {module.contents.length === 1 ? 'aula' : 'aulas'}
                                  </p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pt-4 pb-2 space-y-4">
                                <div className="mb-4">
                                  <Label htmlFor={`module-title-${module.id}`}>Título do Módulo</Label>
                                  <Input
                                    id={`module-title-${module.id}`}
                                    value={module.title}
                                    onChange={(e) => handleUpdateModuleTitle(module.id, e.target.value)}
                                    className="mt-1"
                                  />
                                </div>
                                
                                {module.contents.map((content, contentIndex) => (
                                  <ContentItem
                                    key={content.id}
                                    type={content.type as 'video' | 'text' | 'quiz'}
                                    title={content.title}
                                    index={contentIndex + 1}
                                    moduleIndex={moduleIndex}
                                    contentId={content.id}
                                  />
                                ))}

                                <div className="flex flex-wrap gap-2 mt-4">
                                  <Button variant="outline" size="sm" onClick={() => handleAddContent(moduleIndex, 'video')}>
                                    <Video className="h-4 w-4 mr-2" />
                                    Adicionar Vídeo
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleAddContent(moduleIndex, 'text')}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Adicionar Texto
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleAddContent(moduleIndex, 'quiz')}>
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Adicionar Quiz
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>

                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab('informacoes')}
                        >
                          Voltar
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('precos')}
                          className="gap-2"
                        >
                          Próxima Etapa
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab de Preços e Publicação */}
                <TabsContent value="precos" className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-bold mb-6">Preços e Configurações de Publicação</h2>

                      <div className="space-y-6 mb-8">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço do Curso (R$)*</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Ex: 49.90"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                Defina o preço do seu curso em reais. Use 0 para cursos gratuitos.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <Label className="mb-3 block">Escolha um Plano de Preço*</Label>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Plano Básico */}
                            <div 
                              className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                selectedPlan === 'basic' 
                                  ? 'border-brand-blue ring-2 ring-brand-blue/20' 
                                  : 'border-border hover:border-brand-blue/50'
                              }`}
                              onClick={() => handlePlanSelect('basic')}
                            >
                              <div className="bg-brand-blue/10 p-4 text-center border-b border-border">
                                <h3 className="font-bold">Plano Básico</h3>
                                <p className="text-2xl font-bold mt-2 text-brand-blue">R$ 40,99</p>
                                <p className="text-xs text-muted-foreground mt-1">até 50 alunos</p>
                              </div>
                              <div className="p-4">
                                <ul className="space-y-2">
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Acesso a ferramentas básicas</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Upload de vídeos (até 2GB)</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Relatórios simplificados</span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Plano Standard */}
                            <div 
                              className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                selectedPlan === 'standard' 
                                  ? 'border-brand-blue ring-2 ring-brand-blue/20' 
                                  : 'border-border hover:border-brand-blue/50'
                              }`}
                              onClick={() => handlePlanSelect('standard')}
                            >
                              <div className="bg-brand-blue/10 p-4 text-center border-b border-border relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-brand-yellow text-xs px-3 py-1 font-semibold text-black">
                                  POPULAR
                                </div>
                                <h3 className="font-bold">Plano Standard</h3>
                                <p className="text-2xl font-bold mt-2 text-brand-blue">R$ 149,99</p>
                                <p className="text-xs text-muted-foreground mt-1">até 500 alunos</p>
                              </div>
                              <div className="p-4">
                                <ul className="space-y-2">
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Todas as ferramentas básicas</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Upload de vídeos (até 10GB)</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Relatórios detalhados</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Certificados personalizados</span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Plano Premium */}
                            <div 
                              className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                selectedPlan === 'premium' 
                                  ? 'border-brand-blue ring-2 ring-brand-blue/20' 
                                  : 'border-border hover:border-brand-blue/50'
                              }`}
                              onClick={() => handlePlanSelect('premium')}
                            >
                              <div className="bg-brand-blue/10 p-4 text-center border-b border-border">
                                <h3 className="font-bold">Plano Premium</h3>
                                <p className="text-2xl font-bold mt-2 text-brand-blue">R$ 289,90</p>
                                <p className="text-xs text-muted-foreground mt-1">alunos ilimitados</p>
                              </div>
                              <div className="p-4">
                                <ul className="space-y-2">
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Todos os recursos standard</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Upload de vídeos ilimitado</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Análise avançada de desempenho</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Suporte prioritário</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-brand-green" />
                                    <span>Integração com IA para chatbot</span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-3">
                            Os valores se referem ao preço total do curso que você receberá após as taxas da plataforma (15%).
                          </p>
                        </div>
                      </div>

                      <Alert className="mb-6" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Importante!</AlertTitle>
                        <AlertDescription>
                          Antes de publicar, revise cuidadosamente todas as informações do seu curso. Após a publicação, alterações significativas podem exigir aprovação da nossa equipe.
                        </AlertDescription>
                      </Alert>

                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab('conteudo')}
                        >
                          Voltar
                        </Button>
                        
                        <Button 
                          size="lg" 
                          className="gap-2"
                          onClick={form.handleSubmit(handleSubmit)}
                          disabled={isLoading || uploading}
                        >
                          {isLoading ? 'Publicando...' : 'Publicar Curso'}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Coluna lateral - dicas e informações */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-brand-blue" />
                      Dicas para um Ótimo Curso
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue font-medium text-sm">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Planeje seu conteúdo</p>
                          <p className="text-sm text-muted-foreground">
                            Organize seu curso em módulos e aulas com uma estrutura lógica e progressiva.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue font-medium text-sm">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Crie vídeos de qualidade</p>
                          <p className="text-sm text-muted-foreground">
                            Garanta boa iluminação, áudio claro e um fundo profissional em seus vídeos.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue font-medium text-sm">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Ofereça recursos extras</p>
                          <p className="text-sm text-muted-foreground">
                            Adicione materiais de apoio, PDFs e exercícios para enriquecer a experiência.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 bg-brand-blue/20 rounded-full flex items-center justify-center text-brand-blue font-medium text-sm">
                          4
                        </div>
                        <div>
                          <p className="font-medium">Defina o preço adequado</p>
                          <p className="text-sm text-muted-foreground">
                            Considere o valor do seu conteúdo, público-alvo e preços praticados no mercado.
                          </p>
                        </div>
                      </li>
                    </ul>

                    {profile && (
                      <div className="mt-6 bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Suas Informações</h4>
                        <p className="text-sm mb-2">
                          <span className="font-medium">Nome:</span> {profile.name}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {profile.email}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Precisa de ajuda?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Nossa equipe está disponível para auxiliar em todas as etapas da criação do seu curso.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Ver Tutoriais
                        </Button>
                        <Button size="sm" className="flex-1">
                          Suporte
                        </Button>
                      </div>
                    </div>
                  </CardContent>
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

export default CreateCourse;
