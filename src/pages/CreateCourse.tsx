
import React, { useState } from 'react';
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

const CreateCourse = () => {
  const [activeTab, setActiveTab] = useState('informacoes');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Preços dos planos
  const planPrices = {
    basic: 'R$ 40,99',
    standard: 'R$ 149,99',
    premium: 'R$ 289,90',
  };

  // Funções de manipulação
  const handleAddModule = () => {
    // Lógica para adicionar um novo módulo ao curso
    console.log('Adicionando novo módulo');
  };

  const handleAddContent = (moduleIndex: number, contentType: 'video' | 'text' | 'quiz') => {
    // Lógica para adicionar conteúdo a um módulo
    console.log(`Adicionando conteúdo do tipo ${contentType} ao módulo ${moduleIndex}`);
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
  };

  const handlePublishCourse = () => {
    // Lógica para publicar o curso
    console.log('Publicando curso');
  };

  // Componente para exibir um item de conteúdo do curso
  const ContentItem = ({ type, title, index }: { type: 'video' | 'text' | 'quiz', title: string, index: number }) => {
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                      <div className="mb-6">
                        <Label htmlFor="course-title" className="mb-2 block">
                          Título do Curso*
                        </Label>
                        <Input 
                          id="course-title" 
                          placeholder="Ex: Marketing Digital para Iniciantes"
                          className="mb-1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Escolha um título claro e atrativo que descreva bem o conteúdo do curso.
                        </p>
                      </div>

                      <div className="mb-6">
                        <Label htmlFor="course-subtitle" className="mb-2 block">
                          Subtítulo
                        </Label>
                        <Input 
                          id="course-subtitle" 
                          placeholder="Ex: Aprenda a criar estratégias eficientes para sua presença online"
                          className="mb-1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Um complemento ao título que detalha um pouco mais o que o aluno irá aprender.
                        </p>
                      </div>

                      <div className="mb-6">
                        <Label htmlFor="course-description" className="mb-2 block">
                          Descrição do Curso*
                        </Label>
                        <Textarea 
                          id="course-description" 
                          placeholder="Descreva detalhadamente o que os alunos aprenderão no seu curso..."
                          className="min-h-32 mb-1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Seja específico sobre o que será abordado, os objetivos de aprendizado e para quem o curso é indicado.
                        </p>
                      </div>

                      <div className="mb-6">
                        <Label className="mb-2 block">
                          Categoria Principal*
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
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
                      </div>

                      <div className="mb-6">
                        <Label className="mb-2 block">Imagem de Capa do Curso*</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <div className="mx-auto w-32 h-32 bg-muted mb-4 rounded-lg flex items-center justify-center">
                            <Image className="w-12 h-12 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Arraste uma imagem para cá ou clique para fazer upload
                          </p>
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Escolher Imagem
                          </Button>
                          <p className="text-xs text-muted-foreground mt-3">
                            Recomendamos imagens de pelo menos 1280x720 pixels, no formato JPG ou PNG.
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <Label className="mb-2 block">Duração Estimada do Curso*</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="course-hours" className="text-sm block mb-1">
                              Horas Totais
                            </Label>
                            <div className="flex items-center">
                              <Input
                                id="course-hours"
                                type="number"
                                placeholder="0"
                                min="1"
                              />
                              <span className="ml-2 text-muted-foreground">horas</span>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="course-completion" className="text-sm block mb-1">
                              Tempo para Conclusão
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="course-completion"
                                type="number"
                                placeholder="30"
                                min="1"
                              />
                              <Select defaultValue="dias">
                                <SelectTrigger className="w-24">
                                  <SelectValue placeholder="Dias" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dias">Dias</SelectItem>
                                  <SelectItem value="semanas">Semanas</SelectItem>
                                  <SelectItem value="meses">Meses</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Estas informações ajudam os alunos a planejarem seus estudos.
                        </p>
                      </div>

                      <div className="mb-6">
                        <Label className="mb-2 block">Nível do Curso*</Label>
                        <RadioGroup defaultValue="iniciante">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="iniciante" id="nivel-iniciante" />
                              <Label htmlFor="nivel-iniciante">Iniciante</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="intermediario" id="nivel-intermediario" />
                              <Label htmlFor="nivel-intermediario">Intermediário</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="avancado" id="nivel-avancado" />
                              <Label htmlFor="nivel-avancado">Avançado</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="todos" id="nivel-todos" />
                              <Label htmlFor="nivel-todos">Todos os níveis</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          size="lg" 
                          onClick={() => setActiveTab('conteudo')}
                          className="gap-2"
                        >
                          Próxima Etapa
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
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
                        <AccordionItem value="module-1">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center">
                                1
                              </div>
                              <div className="text-left">
                                <p className="font-medium">Introdução ao Curso</p>
                                <p className="text-xs text-muted-foreground">3 aulas • 15 minutos</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-4 pb-2 space-y-4">
                              <ContentItem type="video" title="Boas-vindas e Visão Geral" index={1} />
                              <ContentItem type="text" title="Material de Apoio" index={2} />
                              <ContentItem type="video" title="Como Aproveitar ao Máximo o Curso" index={3} />

                              <div className="flex flex-wrap gap-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => handleAddContent(0, 'video')}>
                                  <Video className="h-4 w-4 mr-2" />
                                  Adicionar Vídeo
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleAddContent(0, 'text')}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Adicionar Texto
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleAddContent(0, 'quiz')}>
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Adicionar Quiz
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="module-2">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-brand-blue text-white rounded-full flex items-center justify-center">
                                2
                              </div>
                              <div className="text-left">
                                <p className="font-medium">Conceitos Fundamentais</p>
                                <p className="text-xs text-muted-foreground">5 aulas • 45 minutos</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pt-4 pb-2 space-y-4">
                              <ContentItem type="video" title="Fundamentos Teóricos" index={1} />
                              <ContentItem type="video" title="Aplicações Práticas" index={2} />
                              <ContentItem type="text" title="Leitura Complementar" index={3} />
                              <ContentItem type="video" title="Estudo de Caso" index={4} />
                              <ContentItem type="quiz" title="Quiz de Fixação" index={5} />

                              <div className="flex flex-wrap gap-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => handleAddContent(1, 'video')}>
                                  <Video className="h-4 w-4 mr-2" />
                                  Adicionar Vídeo
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleAddContent(1, 'text')}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Adicionar Texto
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleAddContent(1, 'quiz')}>
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Adicionar Quiz
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
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
                                <p className="text-2xl font-bold mt-2 text-brand-blue">{planPrices.basic}</p>
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
                                <p className="text-2xl font-bold mt-2 text-brand-blue">{planPrices.standard}</p>
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
                                <p className="text-2xl font-bold mt-2 text-brand-blue">{planPrices.premium}</p>
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

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <Label>Opções de Disponibilidade</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <HelpCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-64 text-xs">
                                    Você pode escolher publicar seu curso imediatamente ou deixá-lo como rascunho para publicar posteriormente.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <RadioGroup defaultValue="publicar-agora">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="publicar-agora" id="publicar-agora" />
                                <Label htmlFor="publicar-agora">Publicar imediatamente</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="salvar-rascunho" id="salvar-rascunho" />
                                <Label htmlFor="salvar-rascunho">Salvar como rascunho</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="programar-publicacao" id="programar-publicacao" />
                                <Label htmlFor="programar-publicacao">Programar publicação</Label>
                              </div>
                            </div>
                          </RadioGroup>
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
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="lg" className="gap-2">
                              Publicar Curso
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmar Publicação</DialogTitle>
                              <DialogDescription>
                                Seu curso está pronto para ser publicado na plataforma Studying Place. Confira se todas as informações estão corretas.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="space-y-3">
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium">Plano selecionado:</span>
                                  <span className="font-bold text-brand-blue">
                                    {selectedPlan === 'basic' && 'Plano Básico'}
                                    {selectedPlan === 'standard' && 'Plano Standard'}
                                    {selectedPlan === 'premium' && 'Plano Premium'}
                                    {!selectedPlan && 'Nenhum plano selecionado'}
                                  </span>
                                </div>
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium">Preço do curso:</span>
                                  <span className="font-bold">
                                    {selectedPlan === 'basic' && planPrices.basic}
                                    {selectedPlan === 'standard' && planPrices.standard}
                                    {selectedPlan === 'premium' && planPrices.premium}
                                    {!selectedPlan && 'R$ 0,00'}
                                  </span>
                                </div>
                                <div className="flex justify-between pb-2 border-b">
                                  <span className="font-medium">Módulos criados:</span>
                                  <span>2</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Conteúdos adicionados:</span>
                                  <span>8</span>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Cancelar</Button>
                              <Button onClick={handlePublishCourse}>Confirmar Publicação</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
