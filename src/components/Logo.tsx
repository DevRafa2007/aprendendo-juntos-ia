
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-brand-blue to-brand-green rounded-md">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      <span className={`font-bold ${sizeClasses[size]} bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent`}>
        Studying Place
      </span>
    </Link>
  );
};

export default Logo;
