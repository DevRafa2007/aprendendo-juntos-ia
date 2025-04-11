import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, User, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';
import SyncStatusIndicator from './SyncStatusIndicator';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

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
            {isAuthenticated && (
              <Link to="/criar-curso" className="text-foreground hover:text-brand-blue transition-colors font-medium">
                Criar Curso
              </Link>
            )}
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
              <SyncStatusIndicator />
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-brand-blue">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-brand-blue">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <div className="h-9 w-9 rounded-full bg-brand-blue text-white flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{profile?.name || 'Usuário'}</span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil" className="cursor-pointer">Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/meus-cursos" className="cursor-pointer">Meus Cursos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
