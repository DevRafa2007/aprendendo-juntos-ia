
import React from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-brand-blue to-brand-green py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Aprendendo Juntos com IA
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Uma plataforma revolucionária onde professores e alunos se conectam para transformar a educação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cursos">
                <Button size="lg" variant="primary" className="font-medium">
                  Explorar Cursos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/criar-curso">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20 hover:text-white font-medium">
                  Criar um Curso
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <h2 className="text-white font-semibold text-xl mb-4">Encontre o curso perfeito</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="O que você quer aprender hoje?"
                className="w-full pl-10 pr-4 py-3 rounded-lg border-none text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white text-sm">Tecnologia</Button>
              <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white text-sm">Negócios</Button>
              <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white text-sm">Criatividade</Button>
              <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white text-sm">Marketing</Button>
              <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white text-sm">Educação</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
