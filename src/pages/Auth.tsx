import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
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
        router.push('/login');
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
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{isSignUp ? 'Criar Conta' : 'Entrar'}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="seuemail@exemplo.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={isSignUp ? handleSignUp : handleSignIn} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </Button>
        </CardContent>
        <div className="px-6 py-4 text-sm text-muted-foreground">
          {isSignUp ? (
            <>
              Já tem uma conta?{' '}
              <Button variant="link" onClick={() => setIsSignUp(false)}>
                Entrar
              </Button>
            </>
          ) : (
            <>
              Não tem uma conta?{' '}
              <Button variant="link" onClick={() => setIsSignUp(true)}>
                Criar uma conta
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Auth;
