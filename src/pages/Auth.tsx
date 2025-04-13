import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Você será redirecionado para a página inicial.',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error.message);
      } else {
        navigate('/login');
        toast({
          title: 'Cadastro realizado com sucesso!',
          description: 'Verifique seu e-mail para confirmar o cadastro.',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/5 to-brand-green/5">
      <div className="w-full max-w-md px-4 py-8">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-1 bg-gradient-to-r from-brand-blue/10 to-brand-green/10 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">{isSignUp ? 'Criar Conta' : 'Entrar'}</CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? 'Preencha os dados abaixo para criar sua conta' 
                : 'Entre com suas credenciais para acessar a plataforma'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid gap-4 pt-6">
            {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-medium">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-2 focus-visible:ring-brand-blue"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-medium">Email</Label>
              <Input
                id="email"
                placeholder="seuemail@exemplo.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 focus-visible:ring-brand-blue"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-medium">Senha</Label>
              <Input
                id="password"
                placeholder="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 focus-visible:ring-brand-blue"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <Button 
              onClick={isSignUp ? handleSignUp : handleSignIn} 
              disabled={loading}
              className="bg-gradient-to-r from-brand-blue to-brand-green hover:from-brand-blue/90 hover:to-brand-green/90 text-white mt-2"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
            
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">ou</span>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              {isSignUp ? (
                <>
                  Já tem uma conta?{' '}
                  <Button variant="link" onClick={() => setIsSignUp(false)} className="font-semibold text-brand-blue">
                    Entrar
                  </Button>
                </>
              ) : (
                <>
                  Não tem uma conta?{' '}
                  <Button variant="link" onClick={() => setIsSignUp(true)} className="font-semibold text-brand-blue">
                    Criar uma conta
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Studying Place. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Auth;
