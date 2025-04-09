
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface CourseProps {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  image: string;
  instructor: string;
  duration: string;
  completionTime: string;
  isFree: boolean;
  price?: number;
  slug: string;
}

const CourseCard: React.FC<{ course: CourseProps }> = ({ course }) => {
  return (
    <div className="course-card bg-card rounded-lg overflow-hidden border border-border">
      <div className="relative">
        {course.isFree && (
          <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden">
            <div className="bg-brand-green text-white text-xs font-bold px-8 py-1 rotate-[-45deg] absolute top-4 left-[-25px] transform origin-top-right shadow-md">
              GRATUITO
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white text-muted-foreground hover:text-rose-500 rounded-full z-10">
          <Heart className="h-5 w-5" />
        </Button>
        <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/70 to-transparent">
          <Link to={`/categorias/${course.categorySlug}`}>
            <Badge variant="outline" className="bg-white/20 text-white hover:bg-white/30 border-none">
              {course.category}
            </Badge>
          </Link>
        </div>
      </div>
      <div className="p-4">
        <Link to={`/curso/${course.slug}`}>
          <h3 className="font-bold text-lg line-clamp-2 hover:text-brand-blue transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          Por {course.instructor}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Duração {course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Conclusão em {course.completionTime}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div>
            {course.isFree ? (
              <span className="font-bold text-brand-green">Gratuito</span>
            ) : (
              <span className="font-bold text-lg">{`R$ ${course.price?.toFixed(2)}`}</span>
            )}
          </div>
          <Link to={`/curso/${course.slug}`}>
            <Button size="sm">Saiba Mais</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
