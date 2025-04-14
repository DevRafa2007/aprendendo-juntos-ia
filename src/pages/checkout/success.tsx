import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { getCheckoutSession } from '@/services/stripeService';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const verifyCheckout = async () => {
      if (!sessionId) {
        navigate('/');
        return;
      }

      try {
        // Verificar a sessão do Stripe
        const session = await getCheckoutSession(sessionId);
        
        if (session && session.metadata?.courseId) {
          setCourseId(session.metadata.courseId);
          
          toast({
            title: "Pagamento confirmado!",
            description: "Sua matrícula foi realizada com sucesso.",
          });
        } else {
          // Caso não encontre dados válidos na sessão
          throw new Error('Dados da sessão não encontrados');
        }
      } catch (error) {
        console.error('Erro ao verificar checkout:', error);
        toast({
          variant: "destructive",
          title: "Erro na verificação",
          description: "Não foi possível verificar seu pagamento. Entre em contato com o suporte."
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      verifyCheckout();
    }
  }, [sessionId, user, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">Verificando seu pagamento...</h1>
              <p className="text-muted-foreground">Aguarde enquanto confirmamos sua compra.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
              <h1 className="text-3xl font-bold mb-4">Pagamento aprovado!</h1>
              <p className="text-xl mb-8">
                Sua matrícula foi concluída com sucesso!
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 mb-12">
                {courseId && (
                  <Button size="lg" onClick={() => navigate(`/curso/${courseId}`)}>
                    Ir para o curso
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={() => navigate('/meus-cursos')}>
                  Meus cursos
                </Button>
              </div>
              
              <div className="p-6 bg-muted rounded-lg max-w-md">
                <h2 className="font-semibold mb-2">O que acontece agora?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Você já tem acesso completo ao curso. Você pode começar a aprender imediatamente ou acessar o conteúdo a qualquer momento através da página "Meus Cursos".
                </p>
                <div className="text-xs text-muted-foreground">
                  Para qualquer dúvida, entre em contato com nosso suporte em <a href="mailto:suporte@aprendendojuntos.com" className="text-primary hover:underline">suporte@aprendendojuntos.com</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccessPage; 