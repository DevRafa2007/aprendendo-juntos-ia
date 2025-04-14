import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertTriangle, LockIcon, CreditCard, Wallet } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSessionHandler } from '@/api/checkout';

// Esta página será implementada completamente quando integrarmos com o Stripe
// Por enquanto, exibiremos apenas uma versão simulada

interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    id: string;
  };
  image_url: string;
  price: number;
}

const CheckoutPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');
  
  // Carregar dados do curso
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            image_url,
            price,
            instructor_id,
            profiles (
              id, 
              name
            )
          `)
          .eq('id', courseId)
          .single();
          
        if (error) throw error;
        
        // Formatação dos dados para facilitar a exibição
        setCourse({
          id: data.id,
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          price: data.price || 0,
          instructor: {
            id: data.instructor_id,
            name: data.profiles?.name || 'Instrutor'
          }
        });
      } catch (error) {
        console.error('Erro ao carregar dados do curso:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível obter as informações do curso."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId, toast]);
  
  // Processa o pagamento usando o Stripe
  const processPayment = async () => {
    if (!user || !course) return;
    
    setProcessingPayment(true);
    
    try {
      // Chamar serviço para criar sessão de checkout do Stripe
      const result = await createCheckoutSessionHandler(
        course.id,
        user.id,
        course.instructor.id
      );
      
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Falha ao criar sessão de checkout');
      }
      
      // Redirecionar para a página de checkout do Stripe
      window.location.href = result.url;
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setPaymentStatus('error');
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: "Não foi possível iniciar o checkout. Tente novamente mais tarde."
      });
      setProcessingPayment(false);
    }
  };
  
  // Função de renderização condicional baseada no status do pagamento
  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <div className="flex flex-col items-center text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pagamento confirmado!</h2>
            <p className="text-muted-foreground mb-6">
              Sua matrícula foi realizada com sucesso. Você será redirecionado em instantes...
            </p>
            <Button onClick={() => navigate(`/curso/${courseId}`)}>
              Ir para o curso
            </Button>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex flex-col items-center text-center py-8">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Falha no pagamento</h2>
            <p className="text-muted-foreground mb-6">
              Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.
            </p>
            <div className="flex gap-4">
              <Button variant="destructive" onClick={() => setPaymentStatus('pending')}>
                Tentar novamente
              </Button>
              <Button variant="outline" onClick={() => navigate('/suporte')}>
                Contatar suporte
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4">Detalhes do pagamento</h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LockIcon className="h-5 w-5 mr-2 text-green-500" />
                      Pagamento seguro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Selecione seu método de pagamento preferido:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center border rounded-md p-3 cursor-pointer hover:border-brand-blue transition-colors">
                        <CreditCard className="h-5 w-5 mr-3 text-brand-blue" />
                        <div className="flex-1">
                          <div className="font-medium">Cartão de crédito</div>
                          <div className="text-xs text-muted-foreground">Visa, Mastercard, Elo, American Express</div>
                        </div>
                      </div>
                      <div className="flex items-center border rounded-md p-3 cursor-pointer hover:border-brand-blue transition-colors">
                        <Wallet className="h-5 w-5 mr-3 text-brand-blue" />
                        <div className="flex-1">
                          <div className="font-medium">Pix</div>
                          <div className="text-xs text-muted-foreground">Transferência instantânea</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        className="w-full" 
                        onClick={processPayment} 
                        disabled={processingPayment}
                      >
                        {processingPayment ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          "Finalizar Pagamento"
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <p className="text-xs text-muted-foreground flex items-center">
                        <LockIcon className="h-3 w-3 mr-1" />
                        Seus dados estão protegidos com criptografia SSL
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4">Resumo do pedido</h2>
                <Card>
                  <CardContent className="pt-6">
                    {course && (
                      <div className="flex gap-4 mb-6">
                        <div className="w-24 h-16 overflow-hidden rounded-md flex-shrink-0">
                          <img 
                            src={course.image_url || 'https://via.placeholder.com/150'} 
                            alt={course.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">Por {course.instructor.name}</p>
                        </div>
                      </div>
                    )}
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>R$ {course?.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Desconto</span>
                        <span>R$ 0.00</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>R$ {course?.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2 pt-0">
                    <div className="w-full text-xs text-muted-foreground">
                      <p className="mb-1">Ao comprar, você concorda com nossos:</p>
                      <div className="flex gap-2">
                        <a href="/termos" className="text-brand-blue hover:underline">Termos de Uso</a>
                        <span>•</span>
                        <a href="/privacidade" className="text-brand-blue hover:underline">Política de Privacidade</a>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </>
        );
    }
  };
  
  // Carregamento inicial
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4">Detalhes do pagamento</h2>
                <Skeleton className="h-80 w-full rounded-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-4">Resumo do pedido</h2>
                <Skeleton className="h-60 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>
          {renderPaymentStatus()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage; 