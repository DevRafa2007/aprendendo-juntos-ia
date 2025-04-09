
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, MessageSquare, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

const Navbar = () => {
  // Simula um usuário não autenticado para este exemplo
  const isAuthenticated = false;

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Logo />
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-foreground hover:text-brand-blue transition-colors font-medium">
              Home
            </Link>
            <Link to="/cursos" className="text-foreground hover:text-brand-blue transition-colors font-medium">
              Cursos
            </Link>
            <Link to="/criar-curso" className="text-foreground hover:text-brand-blue transition-colors font-medium">
              Criar Curso
            </Link>
            <Link to="/suporte" className="text-foreground hover:text-brand-blue transition-colors font-medium">
              Suporte
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Pesquisar cursos..."
              className="pl-9 pr-4 py-2 bg-muted rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-brand-blue">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-brand-blue">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Link to="/perfil">
                <div className="h-9 w-9 rounded-full bg-brand-blue text-white flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button className="bg-brand-blue hover:bg-brand-blue/90">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
