
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Clock, Lock, Play, FileText, HelpCircle } from 'lucide-react';

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
        return <Play className="h-4 w-4 text-blue-500 mr-2" />;
      case 'text':
        return <FileText className="h-4 w-4 text-green-500 mr-2" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-500 mr-2" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-orange-500 mr-2" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500 mr-2" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seu progresso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seu progresso</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center mb-4">
          <Progress
            value={progressPercent}
            className="h-2 flex-1 mr-3"
          />
          <span className="font-bold w-12 text-right">
            {progressPercent}%
          </span>
        </div>

        <Accordion type="multiple" defaultValue={[modules[0]?.id]}>
          {modules.map((module) => (
            <AccordionItem key={module.id} value={module.id}>
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {module.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : module.locked ? (
                      <Lock className="h-4 w-4 text-gray-500 mr-2" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    )}
                    <span className="font-medium">{module.title}</span>
                  </div>
                  <Badge variant={module.completed ? "default" : "outline"} className="ml-2">
                    {getModuleProgressText(module)}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 mt-2">
                  {module.contents.map((content) => (
                    <li 
                      key={content.id} 
                      className={`p-2 rounded-md ${content.completed ? "bg-green-50" : "bg-white"} 
                        ${content.locked ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-50 cursor-pointer"}`}
                      onClick={() => {
                        if (!content.locked && onContentSelect) {
                          onContentSelect(module.id, content.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {content.locked ? (
                            <Lock className="h-4 w-4 text-gray-500 mr-2" />
                          ) : (
                            renderContentIcon(content.type)
                          )}
                          <span className={content.locked ? "text-gray-500" : ""}>
                            {content.title}
                          </span>
                        </div>
                        {content.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
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
