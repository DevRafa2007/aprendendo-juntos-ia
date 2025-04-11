
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Award, BookOpen, CheckCircle, Play } from 'lucide-react';
import { getCorrectMediaUrl } from '@/services/mediaService';

interface CourseProgressCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    image_url?: string;
    level: string;
    duration: number;
    category?: string;
  };
  progress: number;
  completed: boolean;
  completedContents?: number;
  totalContents?: number;
  lastAccessed?: string;
  resumeContentId?: number | null;
}

const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  course,
  progress,
  completed,
  completedContents = 0,
  totalContents = 0,
  lastAccessed,
  resumeContentId
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Status colorido com base no progresso
  const getStatusBadge = () => {
    if (completed) {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="mr-1 h-3 w-3" />
          Concluído
        </Badge>
      );
    }
    
    if (progress === 0) {
      return (
        <Badge variant="outline">
          Não iniciado
        </Badge>
      );
    }
    
    if (progress < 25) {
      return (
        <Badge variant="secondary">
          Iniciado
        </Badge>
      );
    }
    
    if (progress < 75) {
      return (
        <Badge variant="default">
          Em andamento
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-green-500 text-white">
        Quase concluído
      </Badge>
    );
  };
  
  // Formata a data de último acesso
  const formatLastAccessed = () => {
    if (!lastAccessed) return 'Nunca acessado';
    
    const date = new Date(lastAccessed);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {course.image_url && !imageError ? (
          <img
            src={getCorrectMediaUrl(course.image_url)}
            alt={course.title}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted">
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex justify-between items-end">
            <div>
              {getStatusBadge()}
            </div>
            <Badge variant="outline" className="bg-white/20 text-white border-0">
              {course.level}
            </Badge>
          </div>
        </div>
      </div>
      
      <CardHeader className="px-4 py-3 pb-0">
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 py-3 flex-grow">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Progresso</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{course.duration}h</span>
            </div>
            
            <div className="flex items-center">
              <Award className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>
                {completedContents}/{totalContents} itens
              </span>
            </div>
          </div>
          
          {lastAccessed && (
            <div className="text-xs text-muted-foreground">
              Último acesso: {formatLastAccessed()}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 pt-0">
        <Button 
          asChild 
          className="w-full" 
          variant={completed ? "outline" : "default"}
        >
          <Link to={resumeContentId 
            ? `/curso/${course.id}/conteudo/${resumeContentId}` 
            : `/curso/${course.id}`
          }>
            {completed ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Revisar curso
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                {progress > 0 ? 'Continuar' : 'Iniciar'} curso
              </>
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseProgressCard;
