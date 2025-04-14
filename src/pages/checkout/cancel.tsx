import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CheckoutCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-20 w-20 text-yellow-500 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Pagamento cancelado</h1>
            <p className="text-xl mb-8">
              Seu pagamento foi cancelado e nenhuma cobrança foi realizada.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-12">
              <Button size="lg" onClick={() => window.history.back()}>
                Tentar novamente
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/')}>
                Voltar para página inicial
              </Button>
            </div>
            
            <div className="p-6 bg-muted rounded-lg max-w-md">
              <h2 className="font-semibold mb-2">Encontrou algum problema?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Se você encontrou alguma dificuldade durante o processo de pagamento,
                entre em contato com nosso suporte para obter ajuda.
              </p>
              <div className="text-xs text-muted-foreground">
                Para qualquer dúvida, entre em contato com nosso suporte em <a href="mailto:suporte@aprendendojuntos.com" className="text-primary hover:underline">suporte@aprendendojuntos.com</a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutCancelPage; 