import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, FileText, Video, FileCheck, Trash2, Plus, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VideoUploader from './VideoUploader';
import DocumentUploader from './DocumentUploader';
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type ContentType = 'video' | 'text' | 'quiz' | 'pdf';

export interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  text: string;
  type: 'single' | 'multiple'; // single choice or multiple choice
  options: QuizOption[];
  explanation?: string;
}

export interface ContentItem {
  id: number;
  type: ContentType;
  title: string;
  description?: string;
  video_url?: string;
  video_duration?: number;
  thumbnail_url?: string;
  document_url?: string;
  text_content?: string;
  quiz_questions?: QuizQuestion[];
}

export interface ModuleType {
  id: number;
  title: string;
  contents: ContentItem[];
}

interface ContentEditorProps {
  content: ContentItem;
  moduleId: number;
  onUpdate: (updatedContent: ContentItem) => void;
  onDelete: () => void;
}

const ContentEditor = ({ content, moduleId, onUpdate, onDelete }: ContentEditorProps) => {
  const [localContent, setLocalContent] = useState<ContentItem>({ ...content });
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  
  // Atualiza o estado local quando o conteúdo muda externamente
  useEffect(() => {
    setLocalContent({ ...content });
  }, [content]);
  
  // Atualiza o conteúdo e notifica o componente pai
  const updateContent = (updates: Partial<ContentItem>) => {
    const updated = { ...localContent, ...updates };
    setLocalContent(updated);
    onUpdate(updated);
  };
  
  // Gerencia o upload de vídeo bem-sucedido
  const handleVideoUploaded = (videoUrl: string, duration: number, thumbnailUrl?: string) => {
    updateContent({
      video_url: videoUrl,
      video_duration: duration,
      thumbnail_url: thumbnailUrl
    });
    toast.success('Vídeo enviado com sucesso!');
  };
  
  // Gerencia o upload de documento bem-sucedido
  const handleDocumentUploaded = (documentUrl: string) => {
    updateContent({ document_url: documentUrl });
    toast.success('Documento enviado com sucesso!');
  };

  // Adicionar nova pergunta ao quiz
  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      text: '',
      type: 'single',
      options: [
        { id: Date.now() + 1, text: '', isCorrect: true },
        { id: Date.now() + 2, text: '', isCorrect: false },
      ],
    };
    
    setEditingQuestion(newQuestion);
    setShowQuestionForm(true);
  };

  // Salvar pergunta no quiz
  const handleSaveQuestion = () => {
    if (!editingQuestion) return;
    
    // Validar se a pergunta tem texto
    if (!editingQuestion.text.trim()) {
      toast.error('A pergunta precisa ter um texto');
      return;
    }
    
    // Validar se todas as opções têm texto
    if (editingQuestion.options.some(opt => !opt.text.trim())) {
      toast.error('Todas as opções precisam ter um texto');
      return;
    }
    
    // Validar se pelo menos uma opção está marcada como correta
    if (!editingQuestion.options.some(opt => opt.isCorrect)) {
      toast.error('Pelo menos uma opção deve ser marcada como correta');
      return;
    }
    
    // Atualizar o conteúdo com a nova pergunta
    const updatedQuestions = localContent.quiz_questions || [];
    const existingIndex = updatedQuestions.findIndex(q => q.id === editingQuestion.id);
    
    if (existingIndex >= 0) {
      updatedQuestions[existingIndex] = editingQuestion;
    } else {
      updatedQuestions.push(editingQuestion);
    }
    
    updateContent({ quiz_questions: updatedQuestions });
    setEditingQuestion(null);
    setShowQuestionForm(false);
    toast.success('Pergunta salva com sucesso!');
  };

  // Editar uma pergunta existente
  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion({ ...question });
    setShowQuestionForm(true);
  };

  // Remover pergunta do quiz
  const handleRemoveQuestion = (questionId: number) => {
    const updatedQuestions = (localContent.quiz_questions || [])
      .filter(q => q.id !== questionId);
    
    updateContent({ quiz_questions: updatedQuestions });
    toast.success('Pergunta removida');
  };

  // Adicionar opção à pergunta atual
  const handleAddOption = () => {
    if (!editingQuestion) return;
    
    const newOption: QuizOption = {
      id: Date.now(),
      text: '',
      isCorrect: false
    };
    
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, newOption]
    });
  };

  // Remover opção da pergunta atual
  const handleRemoveOption = (optionId: number) => {
    if (!editingQuestion) return;
    
    // Impedir remover se houver apenas duas opções
    if (editingQuestion.options.length <= 2) {
      toast.error('Uma pergunta precisa ter pelo menos duas opções');
      return;
    }
    
    setEditingQuestion({
      ...editingQuestion,
      options: editingQuestion.options.filter(opt => opt.id !== optionId)
    });
  };

  // Atualizar texto da opção
  const handleOptionTextChange = (optionId: number, text: string) => {
    if (!editingQuestion) return;
    
    setEditingQuestion({
      ...editingQuestion,
      options: editingQuestion.options.map(opt => 
        opt.id === optionId ? { ...opt, text } : opt
      )
    });
  };

  // Atualizar estado de correta da opção
  const handleOptionCorrectChange = (optionId: number, isCorrect: boolean) => {
    if (!editingQuestion) return;
    
    // Para perguntas de escolha única, desmarcar todas as outras opções
    let updatedOptions = [...editingQuestion.options];
    
    if (editingQuestion.type === 'single' && isCorrect) {
      updatedOptions = updatedOptions.map(opt => ({
        ...opt,
        isCorrect: opt.id === optionId
      }));
    } else {
      updatedOptions = updatedOptions.map(opt => 
        opt.id === optionId ? { ...opt, isCorrect } : opt
      );
    }
    
    setEditingQuestion({
      ...editingQuestion,
      options: updatedOptions
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{content.title || 'Novo conteúdo'}</h3>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            {content.type === 'video' && (
              <TabsTrigger value="video">Vídeo</TabsTrigger>
            )}
            {content.type === 'text' && (
              <TabsTrigger value="text">Conteúdo de Texto</TabsTrigger>
            )}
            {content.type === 'pdf' && (
              <TabsTrigger value="document">Documento</TabsTrigger>
            )}
            {content.type === 'quiz' && (
              <TabsTrigger value="quiz">Perguntas do Quiz</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label htmlFor={`content-title-${content.id}`}>Título*</Label>
              <Input
                id={`content-title-${content.id}`}
                value={localContent.title}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="Digite um título para este conteúdo"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor={`content-description-${content.id}`}>Descrição</Label>
              <Textarea
                id={`content-description-${content.id}`}
                value={localContent.description || ''}
                onChange={(e) => updateContent({ description: e.target.value })}
                placeholder="Descreva brevemente este conteúdo"
                className="mt-1"
              />
            </div>
          </TabsContent>
          
          {content.type === 'video' && (
            <TabsContent value="video">
              <Alert variant="default" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Envie seu vídeo em formato MP4, WebM ou MOV. Recomendamos resolução mínima de 720p.
                </AlertDescription>
              </Alert>
              
              <VideoUploader 
                content={localContent as any} 
                onVideoUploaded={handleVideoUploaded}
              />
            </TabsContent>
          )}
          
          {content.type === 'text' && (
            <TabsContent value="text">
              <Label htmlFor={`content-text-${content.id}`}>Conteúdo de Texto*</Label>
              <Textarea
                id={`content-text-${content.id}`}
                value={localContent.text_content || ''}
                onChange={(e) => updateContent({ text_content: e.target.value })}
                placeholder="Digite aqui o conteúdo de texto..."
                className="mt-1 min-h-40"
              />
            </TabsContent>
          )}
          
          {content.type === 'pdf' && (
            <TabsContent value="document">
              <Alert variant="default" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Envie documentos em formato PDF ou DOCX. Tamanho máximo: 10MB.
                </AlertDescription>
              </Alert>
              
              <DocumentUploader
                initialDocumentUrl={localContent.document_url}
                onDocumentUploaded={handleDocumentUploaded}
                maxSizeMB={10}
              />
            </TabsContent>
          )}
          
          {content.type === 'quiz' && (
            <TabsContent value="quiz">
              <div className="space-y-4">
                <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Adicione perguntas para testar o conhecimento dos alunos.
                  </AlertDescription>
                </Alert>
                
                {showQuestionForm && editingQuestion ? (
                  <Card className="mt-4">
                    <CardContent className="pt-6 space-y-4">
                      <h4 className="font-medium">
                        {editingQuestion.id ? 'Editar Pergunta' : 'Nova Pergunta'}
                      </h4>
                      
                      <div>
                        <Label>Texto da Pergunta*</Label>
                        <Textarea 
                          value={editingQuestion.text} 
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            text: e.target.value
                          })}
                          placeholder="Digite a pergunta aqui..."
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Tipo de Pergunta</Label>
                        <RadioGroup 
                          value={editingQuestion.type}
                          onValueChange={(value) => setEditingQuestion({
                            ...editingQuestion,
                            type: value as 'single' | 'multiple'
                          })}
                          className="mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="single" />
                            <Label htmlFor="single">Escolha Única</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multiple" id="multiple" />
                            <Label htmlFor="multiple">Múltipla Escolha</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Opções</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={handleAddOption}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Opção
                          </Button>
                        </div>
                        
                        {editingQuestion.options.map((option, index) => (
                          <div key={option.id} className="flex items-center gap-2 mt-2">
                            {editingQuestion.type === 'single' ? (
                              <RadioGroup value={option.isCorrect ? 'correct' : 'incorrect'}>
                                <RadioGroupItem 
                                  value="correct" 
                                  checked={option.isCorrect}
                                  onClick={() => handleOptionCorrectChange(option.id, true)}
                                />
                              </RadioGroup>
                            ) : (
                              <Checkbox 
                                checked={option.isCorrect}
                                onCheckedChange={(checked) => 
                                  handleOptionCorrectChange(option.id, checked === true)
                                }
                              />
                            )}
                            
                            <Input 
                              value={option.text}
                              onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                              placeholder={`Opção ${index + 1}`}
                              className="flex-grow"
                            />
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemoveOption(option.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <Label htmlFor="explanation">Explicação (opcional)</Label>
                        <Textarea
                          id="explanation"
                          value={editingQuestion.explanation || ''}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            explanation: e.target.value
                          })}
                          placeholder="Explique por que esta resposta é correta..."
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowQuestionForm(false);
                            setEditingQuestion(null);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveQuestion}>
                          <Check className="h-4 w-4 mr-2" />
                          Salvar Pergunta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {(!localContent.quiz_questions || localContent.quiz_questions.length === 0) ? (
                      <div className="border rounded-md p-4 text-center text-muted-foreground">
                        <p className="mb-3">Ainda não há perguntas neste quiz</p>
                        <Button variant="outline" onClick={handleAddQuestion}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Pergunta
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {localContent.quiz_questions?.map((question) => (
                          <Card key={question.id} className="overflow-hidden">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{question.text}</h4>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditQuestion(question)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveQuestion(question.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="text-sm text-muted-foreground">
                                {question.type === 'single' ? 'Escolha Única' : 'Múltipla Escolha'} · 
                                {question.options.length} opções
                              </div>
                              
                              <div className="mt-2 space-y-1">
                                {question.options.map((option) => (
                                  <div 
                                    key={option.id} 
                                    className={`text-sm pl-2 border-l-2 ${
                                      option.isCorrect 
                                        ? 'border-green-500 text-green-600' 
                                        : 'border-muted text-muted-foreground'
                                    }`}
                                  >
                                    {option.text}
                                    {option.isCorrect && ' (Correta)'}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleAddQuestion}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Nova Pergunta
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export interface ModuleEditorProps {
  module: ModuleType;
  onUpdate: (updatedModule: ModuleType) => void;
  onDelete: () => void;
}

export const ModuleEditor = ({ module, onUpdate, onDelete }: ModuleEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const updateModuleTitle = (title: string) => {
    onUpdate({ ...module, title });
  };
  
  const addContent = (type: ContentType) => {
    const newId = module.contents.length > 0
      ? Math.max(...module.contents.map(c => c.id)) + 1
      : 1;
      
    const titles = {
      video: 'Novo Vídeo',
      text: 'Novo Material de Texto',
      quiz: 'Novo Quiz',
      pdf: 'Novo Documento PDF'
    };
    
    const newContent: ContentItem = {
      id: newId,
      type,
      title: titles[type],
    };
    
    onUpdate({
      ...module,
      contents: [...module.contents, newContent]
    });
  };
  
  const updateContent = (updatedContent: ContentItem) => {
    onUpdate({
      ...module,
      contents: module.contents.map(content =>
        content.id === updatedContent.id ? updatedContent : content
      )
    });
  };
  
  const deleteContent = (contentId: number) => {
    onUpdate({
      ...module,
      contents: module.contents.filter(content => content.id !== contentId)
    });
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div>
              <Label htmlFor={`module-title-${module.id}`}>Título do Módulo</Label>
              <Input
                id={`module-title-${module.id}`}
                value={module.title}
                onChange={(e) => updateModuleTitle(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Recolher Conteúdos' : 'Expandir Conteúdos'}
        </Button>
        
        {isExpanded && (
          <div className="space-y-4">
            {module.contents.map(content => (
              <ContentEditor
                key={content.id}
                content={content}
                moduleId={module.id}
                onUpdate={updateContent}
                onDelete={() => deleteContent(content.id)}
              />
            ))}
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" onClick={() => addContent('video')}>
                <Video className="h-4 w-4 mr-2" />
                Adicionar Vídeo
              </Button>
              <Button variant="outline" onClick={() => addContent('text')}>
                <FileText className="h-4 w-4 mr-2" />
                Adicionar Texto
              </Button>
              <Button variant="outline" onClick={() => addContent('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Adicionar Documento
              </Button>
              <Button variant="outline" onClick={() => addContent('quiz')}>
                <FileCheck className="h-4 w-4 mr-2" />
                Adicionar Quiz
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentEditor; 