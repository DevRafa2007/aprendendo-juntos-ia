
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, HelpCircle, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mb-6 text-brand-blue">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-24 w-24 mx-auto"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-7xl font-bold text-brand-blue mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Página não encontrada</h2>
          <p className="text-muted-foreground mb-8">
            Desculpe, a página que você está procurando não existe ou foi movida.
            Tente navegar para outra seção ou retornar à página inicial.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="gap-2 w-full">
                <Home className="h-4 w-4" />
                Página Inicial
              </Button>
            </Link>
            <Link to="/cursos">
              <Button variant="outline" className="gap-2 w-full">
                <Search className="h-4 w-4" />
                Explorar Cursos
              </Button>
            </Link>
            <Link to="/suporte">
              <Button variant="outline" className="gap-2 w-full">
                <HelpCircle className="h-4 w-4" />
                Suporte
              </Button>
            </Link>
          </div>
          <Button 
            variant="ghost" 
            className="mt-6 gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página anterior
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
