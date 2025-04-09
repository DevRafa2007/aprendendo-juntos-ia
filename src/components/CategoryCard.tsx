
import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  icon: React.ReactNode;
  name: string;
  courseCount: number;
  slug: string;
  color: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, name, courseCount, slug, color }) => {
  return (
    <Link to={`/categorias/${slug}`}>
      <div className="flex flex-col items-center p-6 bg-card rounded-lg border border-border hover:border-brand-blue transition-all cursor-pointer group">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${color}`}>
          {icon}
        </div>
        <h3 className="font-bold text-lg group-hover:text-brand-blue transition-colors">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{courseCount} cursos</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
