
import React from 'react';
import { Users, BookOpen, Award, Lightbulb } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: <Users className="h-6 w-6 text-brand-blue" />,
      count: '10,000+',
      label: 'Alunos Ativos',
    },
    {
      icon: <BookOpen className="h-6 w-6 text-brand-green" />,
      count: '500+',
      label: 'Cursos Disponíveis',
    },
    {
      icon: <Award className="h-6 w-6 text-brand-yellow" />,
      count: '250+',
      label: 'Professores Qualificados',
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-brand-blue" />,
      count: '25+',
      label: 'Categorias de Aprendizado',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-6 bg-card rounded-lg border border-border"
          >
            <div className="mb-3">{stat.icon}</div>
            <span className="text-3xl font-bold text-foreground">{stat.count}</span>
            <span className="text-sm text-muted-foreground mt-1 text-center">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
