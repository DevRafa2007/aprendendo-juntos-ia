
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  redirectIfAuth?: boolean;
  redirectAuthTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  redirectTo = '/login',
  redirectIfAuth = false,
  redirectAuthTo = '/',
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      // Se precisar estar autenticado e não estiver, redireciona
      if (requireAuth && !user) {
        navigate(redirectTo);
      }
      
      // Se precisar NÃO estar autenticado e estiver, redireciona
      if (redirectIfAuth && user) {
        navigate(redirectAuthTo);
      }
    }
  }, [user, isLoading, navigate, requireAuth, redirectTo, redirectIfAuth, redirectAuthTo]);

  // Mostra loading enquanto verifica a autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Se não precisa estar autenticado OU precisa estar autenticado e está
  if (!requireAuth || (requireAuth && user)) {
    return <>{children}</>;
  }

  // Se não precisa estar autenticado e está OU precisa estar autenticado e não está
  if (!redirectIfAuth || (redirectIfAuth && !user)) {
    return <>{children}</>;
  }

  return null;
};

export default AuthGuard;
