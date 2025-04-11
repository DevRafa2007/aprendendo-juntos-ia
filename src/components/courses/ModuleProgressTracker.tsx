import React, { useState, useEffect } from 'react';
import { useContentProgress } from '@/hooks/useContentProgress';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Progress,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui';
import {
  CheckCircle2,
  PlayCircle,
  FileText,
  FileQuestion,
  FileBadge,
  ChevronRight,
  Lock,
} from 'lucide-react';

interface ContentItem {
  id: number;
  title: string;
  type: 'video' | 'text' | 'document' | 'quiz';
  duration?: number;
  completed?: boolean;
  last_position?: number;
  locked?: boolean;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  contents: ContentItem[];
}

interface ModuleProgressTrackerProps {
  courseId: string;
  module: Module;
  isEnrolled: boolean;
  onSelectContent: (contentId: number, contentType: string) => void;
  currentContentId?: number;
}

const ModuleProgressTracker: React.FC<ModuleProgressTrackerProps> = ({
  courseId,
  module,
  isEnrolled,
  onSelectContent,
  currentContentId,
}) => {
  const [progressData, setProgressData] = useState<Record<number, any>>({});
  const [moduleProgress, setModuleProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const { getCourseContentProgress } = useContentProgress();
  const { updateProgress } = useEnrollment();
  const { toast } = useToast();

  // Carregar progresso de todos os conteúdos do módulo
  useEffect(() => {
    const loadContentProgress = async () => {
      if (!isEnrolled || !courseId) return;

      try {
        setLoading(true);
        const { data } = await getCourseContentProgress(courseId);
        
        if (data) {
          const moduleContentProgress: Record<number, any> = {};
          let completedCount = 0;
          
          // Filtrar e organizar o progresso apenas para este módulo
          module.contents.forEach(content => {
            const progress = data.find(p => p.content_id === content.id);
            moduleContentProgress[content.id] = progress || { completed: false };
            
            if (progress?.completed) {
              completedCount++;
            }
          });
          
          setProgressData(moduleContentProgress);
          
          // Calcular a porcentagem de progresso do módulo
          const totalContents = module.contents.length;
          const progressPercentage = totalContents > 0 
            ? (completedCount / totalContents) * 100 
            : 0;
          
          setModuleProgress(progressPercentage);
        }
      } catch (error) {
        console.error('Erro ao carregar progresso do módulo:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar o progresso do módulo"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isEnrolled) {
      loadContentProgress();
    }
  }, [courseId, module, isEnrolled]);

  // Expandir automaticamente se o conteúdo atual estiver neste módulo
  useEffect(() => {
    if (currentContentId && module.contents.some(c => c.id === currentContentId)) {
      setExpanded(true);
    }
  }, [currentContentId, module.contents]);

  // Formatar a duração
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return '';
    
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hrs > 0) {
      return `${hrs}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    
    return `${mins}min`;
  };

  // Renderizar ícone com base no tipo de conteúdo
  const renderContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'document':
        return <FileBadge className="h-4 w-4" />;
      case 'quiz':
        return <FileQuestion className="h-4 w-4" />;
      default:
        return <ChevronRight className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Accordion
        type="single"
        collapsible
        value={expanded ? 'module' : ''}
        onValueChange={(value) => setExpanded(value === 'module')}
      >
        <AccordionItem value="module" className="border-b-0">
          <CardHeader className="p-4 pb-0">
            <AccordionTrigger className="flex items-center justify-between py-2 hover:no-underline">
              <div className="flex flex-col items-start">
                <CardTitle className="text-lg font-semibold">{module.title}</CardTitle>
                {module.description && (
                  <CardDescription className="text-sm mt-1">{module.description}</CardDescription>
                )}
              </div>
            </AccordionTrigger>
          </CardHeader>
          
          <AccordionContent>
            <CardContent className="p-4 pt-2">
              {/* Barra de progresso */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progresso</span>
                  <span>{Math.round(moduleProgress)}%</span>
                </div>
                <Progress value={moduleProgress} className="h-2" />
              </div>
              
              {/* Lista de conteúdos */}
              <ul className="space-y-1">
                {module.contents.map((content) => {
                  const progress = progressData[content.id];
                  const isCompleted = progress?.completed || false;
                  const isActive = currentContentId === content.id;
                  const isLocked = content.locked && !isCompleted;
                  
                  return (
                    <li key={content.id}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start text-left h-auto py-2 ${
                          isCompleted ? 'text-green-600' : ''
                        } ${isLocked ? 'opacity-60' : ''}`}
                        onClick={() => !isLocked && onSelectContent(content.id, content.type)}
                        disabled={isLocked || !isEnrolled}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : isLocked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              renderContentIcon(content.type)
                            )}
                          </div>
                          
                          <div className="flex-grow overflow-hidden">
                            <div className="truncate">{content.title}</div>
                          </div>
                          
                          {content.duration && (
                            <div className="flex-shrink-0 text-xs text-muted-foreground">
                              {formatDuration(content.duration)}
                            </div>
                          )}
                        </div>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {!isEnrolled && (
        <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
          <p>Matricule-se para acessar este conteúdo</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ModuleProgressTracker; 