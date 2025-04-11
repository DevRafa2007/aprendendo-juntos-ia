import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { SubjectType } from '@/lib/categories';

interface SubjectCardProps {
  subject: SubjectType;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  // Lista de ícones para diferentes matérias (emoji como placeholder)
  const subjectIcons: Record<string, string> = {
    'matematica': '🧮',
    'algebra': '📊',
    'geometria': '📐',
    'estatistica': '📉',
    'lingua-portuguesa': '📝',
    'gramatica': '📖',
    'redacao': '✍️',
    'literatura': '📚',
    'biologia': '🔬',
    'fisica': '⚛️',
    'quimica': '⚗️',
    'historia': '📜',
    'geografia': '🌎',
    'filosofia': '🧠',
    'sociologia': '👥',
    'ingles': '🇬🇧',
    'espanhol': '🇪🇸',
    'educacao-fisica': '🏃',
    'artes': '🎨',
    'informatica-educativa': '💻',
  };

  // Obter o ícone correspondente ou usar um padrão
  const icon = subjectIcons[subject.slug] || '📚';

  return (
    <Link to={`/materias/${subject.slug}`}>
      <div className="relative h-32 rounded-lg border border-border bg-card p-4 hover:border-brand-blue transition-colors group overflow-hidden">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl">
          {icon}
        </div>
        
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg group-hover:text-brand-blue transition-colors">
              {subject.name}
            </h3>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen className="mr-1 h-4 w-4" />
            <span>Explorar cursos</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SubjectCard; 