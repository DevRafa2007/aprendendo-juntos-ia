
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';

interface FormState {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
  acceptTerms?: boolean;
}

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    rememberMe: false,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    // Limpar erro ao digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (name: 'rememberMe' | 'acceptTerms', checked: boolean) => {
    setFormState(prev => ({ ...prev, [name]: checked }));
    // Limpar erro ao marcar checkbox
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação de email
    if (!formState.email) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação de senha
    if (!formState.password) {
      newErrors.password = 'A senha é obrigatória';
    } else if (formState.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    // Validações adicionais para o cadastro
    if (!isLogin) {
      if (!formState.name) {
        newErrors.name = 'O nome é obrigatório';
      }

      if (!formState.confirmPassword) {
        newErrors.confirmPassword = 'Confirme sua senha';
      } else if (formState.password !== formState.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }

      if (!formState.acceptTerms) {
        newErrors.acceptTerms = 'Você deve aceitar os termos e condições';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulação de uma requisição
    setTimeout(() => {
      setIsLoading(false);
      // Redirecionar para a página inicial após autenticação bem-sucedida
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <div className="py-6 px-8 flex items-center justify-between bg-background border-b">
        <Link to="/">
          <Logo />
        </Link>
        <div>
          {isLogin ? (
            <span className="text-sm text-muted-foreground mr-2">Não tem uma conta?</span>
          ) : (
            <span className="text-sm text-muted-foreground mr-2">Já tem uma conta?</span>
          )}
          <Link to={isLogin ? '/cadastro' : '/login'}>
            <Button variant="link" className="p-0">
              {isLogin ? 'Cadastre-se' : 'Entrar'}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue={isLogin ? 'login' : 'register'}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger 
                value="login" 
                onClick={() => navigate('/login')}
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                onClick={() => navigate('/cadastro')}
              >
                Cadastro
              </TabsTrigger>
            </TabsList>

            {/* Conteúdo Login */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Bem-vindo(a) de volta!</CardTitle>
                  <CardDescription>
                    Entre com seu email e senha para acessar sua conta.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formState.email}
                        onChange={handleChange}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Senha</Label>
                        <Link to="/recuperar-senha" className="text-xs text-brand-blue hover:underline">
                          Esqueceu a senha?
                        </Link>
                      </div>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formState.password}
                        onChange={handleChange}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && (
                        <p className="text-xs text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={formState.rememberMe}
                        onCheckedChange={(checked) => handleCheckboxChange('rememberMe', checked as boolean)}
                      />
                      <Label htmlFor="remember-me" className="text-sm">Lembrar de mim</Label>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col">
                    <Button 
                      type="submit" 
                      className="w-full mb-4" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>

                    <div className="relative w-full mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-muted"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Ou continue com
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="w-full">Google</Button>
                      <Button variant="outline" className="w-full">Facebook</Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Conteúdo Cadastro */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Crie sua conta</CardTitle>
                  <CardDescription>
                    Cadastre-se para acessar milhares de cursos e iniciar sua jornada de aprendizado.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nome completo</Label>
                      <Input
                        id="register-name"
                        name="name"
                        placeholder="Seu nome completo"
                        value={formState.name}
                        onChange={handleChange}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formState.email}
                        onChange={handleChange}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formState.password}
                        onChange={handleChange}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && (
                        <p className="text-xs text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                      <Input
                        id="register-confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={formState.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'border-destructive' : ''}
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="accept-terms"
                        checked={formState.acceptTerms}
                        onCheckedChange={(checked) => handleCheckboxChange('acceptTerms', checked as boolean)}
                        className={`mt-1 ${errors.acceptTerms ? 'border-destructive' : ''}`}
                      />
                      <div>
                        <Label htmlFor="accept-terms" className="text-sm">
                          Eu aceito os{' '}
                          <Link to="/termos" className="text-brand-blue hover:underline">
                            termos de serviço
                          </Link>{' '}
                          e a{' '}
                          <Link to="/privacidade" className="text-brand-blue hover:underline">
                            política de privacidade
                          </Link>
                        </Label>
                        {errors.acceptTerms && (
                          <p className="text-xs text-destructive">{errors.acceptTerms}</p>
                        )}
                      </div>
                    </div>

                    {Object.keys(errors).length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>
                          Corrija os erros acima para continuar.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>

                  <CardFooter className="flex flex-col">
                    <Button 
                      type="submit" 
                      className="w-full mb-4" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Cadastrando...' : 'Criar conta'}
                    </Button>

                    <div className="relative w-full mb-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-muted"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Ou cadastre-se com
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="w-full">Google</Button>
                      <Button variant="outline" className="w-full">Facebook</Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
