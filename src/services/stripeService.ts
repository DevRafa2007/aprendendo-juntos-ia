// Este arquivo contém a implementação do serviço Stripe para processamento de pagamentos
// Utilizando as chaves configuradas no .env

import { supabase } from '@/integrations/supabase/client';
import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Função para obter a chave secreta do Stripe
const getStripeSecretKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.STRIPE_SECRET_KEY) {
    return process.env.STRIPE_SECRET_KEY;
  }
  if (import.meta && import.meta.env && import.meta.env.VITE_STRIPE_SECRET_KEY) {
    return import.meta.env.VITE_STRIPE_SECRET_KEY;
  }
  console.warn('Chave secreta do Stripe não encontrada');
  return '';
};

// Função para obter o webhook secret do Stripe
const getStripeWebhookSecret = () => {
  if (typeof process !== 'undefined' && process.env && process.env.STRIPE_WEBHOOK_SECRET) {
    return process.env.STRIPE_WEBHOOK_SECRET;
  }
  if (import.meta && import.meta.env && import.meta.env.VITE_STRIPE_WEBHOOK_SECRET) {
    return import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;
  }
  console.warn('Webhook secret do Stripe não encontrado');
  return '';
};

// Função para obter a URL base da aplicação
const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (import.meta && import.meta.env && import.meta.env.VITE_NEXT_PUBLIC_BASE_URL) {
    return import.meta.env.VITE_NEXT_PUBLIC_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  console.warn('URL base não encontrada');
  return 'http://localhost:3000';
};

// Inicialização do cliente Stripe com a chave secreta
const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2023-10-16', // Usar a versão mais recente disponível
});

// Cliente Stripe para o frontend
export const getStripePromise = () => {
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');
};

// Interfaces para definição de tipos
export interface StripeAccountType {
  id: string;
  userId: string;
  stripeAccountId: string;
  accountStatus: 'pending' | 'verified' | 'rejected';
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastPayoutAt?: string | null;
}

export interface StripeProductType {
  id: string;
  courseId: string;
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  currency: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StripeTransactionType {
  id: string;
  userId: string;
  courseId: string;
  instructorId: string;
  stripeCheckoutId?: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface InstructorPayoutType {
  id: string;
  instructorId: string;
  stripeAccountId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  payoutId?: string;
  payoutDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Implementação do serviço Stripe
export const stripeService = {
  // Funções para instrutores (professores)
  instructor: {
    /**
     * Cria uma conta Stripe Connect para um instrutor
     */
    createConnectAccount: async (userId: string) => {
      try {
        // Criar conta Express no Stripe
        const account = await stripe.accounts.create({
          type: 'express',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          metadata: { 
            userId 
          },
        });

        // Salvar referência da conta no Supabase
        const { error } = await supabase
          .from('stripe_accounts')
          .insert({
            user_id: userId,
            stripe_account_id: account.id,
            account_status: 'pending',
            onboarding_complete: false,
            payouts_enabled: false,
          });

        if (error) throw error;

        // Criar link de onboarding
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${getBaseUrl()}/instructor/stripe/refresh`,
          return_url: `${getBaseUrl()}/instructor/stripe/complete`,
          type: 'account_onboarding',
        });

        return {
          accountLink: accountLink.url,
          accountId: account.id
        };
      } catch (error) {
        console.error('Erro ao criar conta Stripe Connect:', error);
        throw error;
      }
    },
    
    /**
     * Verifica o status da conta Stripe Connect de um instrutor
     */
    getAccountStatus: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('stripe_accounts')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (error) throw error;
        
        if (!data) return null;
        
        // Atualizar informações da conta diretamente do Stripe
        const account = await stripe.accounts.retrieve(data.stripe_account_id);
        
        // Atualizar o status no banco de dados se necessário
        const newStatus = account.charges_enabled ? 'verified' : 'pending';
        if (newStatus !== data.account_status || account.payouts_enabled !== data.payouts_enabled) {
          await supabase
            .from('stripe_accounts')
            .update({
              account_status: newStatus,
              onboarding_complete: account.details_submitted,
              payouts_enabled: account.payouts_enabled,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
        
        return {
          accountId: data.stripe_account_id,
          status: newStatus,
          onboardingComplete: account.details_submitted,
          payoutsEnabled: account.payouts_enabled
        };
      } catch (error) {
        console.error('Erro ao verificar status da conta Stripe:', error);
        throw error;
      }
    },
    
    /**
     * Obtém todas as transações/pagamentos recebidos por um instrutor
     */
    getTransactions: async (instructorId: string) => {
      const { data, error } = await supabase
        .from('stripe_transactions')
        .select('*')
        .eq('instructor_id', instructorId);
        
      if (error) throw error;
      
      return data || [];
    },
    
    /**
     * Obtém todos os pagamentos feitos a um instrutor
     */
    getPayouts: async (instructorId: string) => {
      const { data, error } = await supabase
        .from('instructor_payouts')
        .select('*')
        .eq('instructor_id', instructorId);
        
      if (error) throw error;
      
      return data || [];
    }
  },
  
  // Funções para cursos e produtos
  products: {
    /**
     * Cria um produto no Stripe para um curso
     */
    createProduct: async (courseId: string, price: number, title: string, description?: string) => {
      try {
        // Criar produto no Stripe
        const product = await stripe.products.create({
          name: title,
          description: description || '',
          metadata: {
            courseId
          }
        });
        
        // Criar preço para o produto
        const stripePrice = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(price * 100), // Stripe trabalha com centavos
          currency: 'brl',
        });
        
        // Salvar no Supabase
        const { error } = await supabase
          .from('stripe_products')
          .insert({
            course_id: courseId,
            stripe_product_id: product.id,
            stripe_price_id: stripePrice.id,
            price: price,
            currency: 'brl',
            active: true,
          });
          
        if (error) throw error;
        
        return {
          productId: product.id,
          priceId: stripePrice.id,
          price: price
        };
      } catch (error) {
        console.error('Erro ao criar produto Stripe:', error);
        throw error;
      }
    },
    
    /**
     * Atualiza um produto no Stripe
     */
    updateProduct: async (courseId: string, updates: { price?: number, active?: boolean }) => {
      try {
        // Buscar produto existente
        const { data, error } = await supabase
          .from('stripe_products')
          .select('*')
          .eq('course_id', courseId)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Produto não encontrado');
        
        // Atualizar preço se necessário
        if (updates.price !== undefined && updates.price !== data.price) {
          // Desativar preço anterior
          await stripe.prices.update(data.stripe_price_id, { active: false });
          
          // Criar novo preço
          const newPrice = await stripe.prices.create({
            product: data.stripe_product_id,
            unit_amount: Math.round(updates.price * 100),
            currency: 'brl',
          });
          
          // Atualizar no Supabase
          await supabase
            .from('stripe_products')
            .update({
              stripe_price_id: newPrice.id,
              price: updates.price,
              updated_at: new Date().toISOString()
            })
            .eq('course_id', courseId);
        }
        
        // Atualizar status se necessário
        if (updates.active !== undefined && updates.active !== data.active) {
          await stripe.products.update(data.stripe_product_id, {
            active: updates.active
          });
          
          await supabase
            .from('stripe_products')
            .update({
              active: updates.active,
              updated_at: new Date().toISOString()
            })
            .eq('course_id', courseId);
        }
        
        return true;
      } catch (error) {
        console.error('Erro ao atualizar produto Stripe:', error);
        throw error;
      }
    },
    
    /**
     * Obtém detalhes de um produto
     */
    getProduct: async (courseId: string) => {
      const { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .eq('course_id', courseId)
        .single();
        
      if (error) throw error;
      
      return data;
    }
  },
  
  // Funções para checkout e pagamentos
  checkout: {
    /**
     * Cria uma sessão de checkout para compra de um curso
     */
    createCheckoutSession: async (courseId: string, userId: string) => {
      try {
        // Buscar dados do produto
        const { data: product, error: productError } = await supabase
          .from('stripe_products')
          .select('*')
          .eq('course_id', courseId)
          .eq('active', true)
          .single();
          
        if (productError || !product) throw new Error('Produto não encontrado ou inativo');
        
        // Buscar dados do instrutor
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('instructor_id')
          .eq('id', courseId)
          .single();
          
        if (courseError || !course) throw new Error('Curso não encontrado');
        
        // Buscar conta Stripe do instrutor
        const { data: instructorAccount, error: instructorError } = await supabase
          .from('stripe_accounts')
          .select('stripe_account_id')
          .eq('user_id', course.instructor_id)
          .single();
          
        if (instructorError || !instructorAccount) throw new Error('Conta do instrutor não encontrada');
        
        // Calcular valores (exemplo: 80% para o instrutor, 20% para a plataforma)
        const applicationFeePercent = 20;
        
        // Criar sessão de checkout
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: product.stripe_price_id,
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${getBaseUrl()}/cursos/pagamento-sucesso?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${getBaseUrl()}/cursos/${courseId}`,
          client_reference_id: userId,
          metadata: {
            courseId,
            userId,
            instructorId: course.instructor_id
          },
          payment_intent_data: {
            application_fee_amount: Math.round((product.price * applicationFeePercent) / 100 * 100),
            transfer_data: {
              destination: instructorAccount.stripe_account_id,
            },
          },
        });
        
        // Registrar transação no banco
        const { error: transactionError } = await supabase
          .from('stripe_transactions')
          .insert({
            user_id: userId,
            course_id: courseId,
            instructor_id: course.instructor_id,
            stripe_checkout_id: session.id,
            amount: product.price,
            currency: 'brl',
            payment_status: 'pending',
          });
          
        if (transactionError) {
          console.error('Erro ao registrar transação:', transactionError);
          // Continuar mesmo com erro no registro da transação
        }
        
        return {
          checkoutUrl: session.url || '',
          sessionId: session.id
        };
      } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        throw error;
      }
    },
    
    /**
     * Verifica o status de uma transação
     */
    getTransactionStatus: async (transactionId: string) => {
      const { data, error } = await supabase
        .from('stripe_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
        
      if (error) throw error;
      
      return data?.payment_status || 'unknown';
    },
    
    /**
     * Obtém todas as transações de um usuário
     */
    getUserTransactions: async (userId: string) => {
      const { data, error } = await supabase
        .from('stripe_transactions')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      return data || [];
    }
  },
  
  // Funções para webhooks
  webhooks: {
    /**
     * Processa um evento de webhook do Stripe
     */
    handleWebhookEvent: async (event: any, signature: string) => {
      try {
        // Verificar assinatura do webhook
        const stripeEvent = stripe.webhooks.constructEvent(
          event,
          signature,
          getStripeWebhookSecret()
        );
        
        switch (stripeEvent.type) {
          case 'checkout.session.completed': {
            const session = stripeEvent.data.object as Stripe.Checkout.Session;
            
            // Atualizar status da transação
            if (session.client_reference_id && session.metadata?.courseId) {
              await supabase
                .from('stripe_transactions')
                .update({
                  payment_status: 'succeeded',
                  stripe_payment_intent_id: session.payment_intent as string,
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_checkout_id', session.id);
                
              // Adicionar usuário ao curso
              await supabase
                .from('user_courses')
                .insert({
                  user_id: session.client_reference_id,
                  course_id: session.metadata.courseId,
                  paid: true,
                  enrollment_date: new Date().toISOString()
                });
            }
            break;
          }
          
          case 'account.updated': {
            const account = stripeEvent.data.object as Stripe.Account;
            
            // Atualizar status da conta do instrutor
            const { data } = await supabase
              .from('stripe_accounts')
              .select('user_id')
              .eq('stripe_account_id', account.id)
              .single();
              
            if (data) {
              await supabase
                .from('stripe_accounts')
                .update({
                  account_status: account.charges_enabled ? 'verified' : 'pending',
                  onboarding_complete: account.details_submitted,
                  payouts_enabled: account.payouts_enabled,
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_account_id', account.id);
            }
            break;
          }
          
          // Adicionar outros casos conforme necessário
        }
        
        return true;
      } catch (error) {
        console.error('Erro ao processar webhook do Stripe:', error);
        throw error;
      }
    }
  }
};

export default stripeService;

/**
 * Cria uma sessão de checkout do Stripe
 */
export async function createCheckoutSession(
  productId: string,
  userId: string,
  instructorId: string
) {
  try {
    // Buscar informações do produto
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Produto não encontrado');
    }

    // Buscar informações do instrutor
    const { data: instructor, error: instructorError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', instructorId)
      .single();

    if (instructorError || !instructor) {
      throw new Error('Instrutor não encontrado');
    }

    // Se o instrutor tem uma conta Stripe, usar o connected account
    const stripeAccountId = instructor.stripe_account_id;
    
    // Calcular a comissão da plataforma (exemplo: 10%)
    const platformFee = Math.round(product.price * 0.1);
    
    // Criar a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.image_url ? [product.image_url] : undefined,
            },
            unit_amount: product.price, // em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${getBaseUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBaseUrl()}/checkout/cancel`,
      metadata: {
        productId,
        userId,
        instructorId,
      },
      payment_intent_data: stripeAccountId
        ? {
            application_fee_amount: platformFee,
            transfer_data: {
              destination: stripeAccountId,
            },
          }
        : undefined,
    });

    return session;
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    throw error;
  }
}

/**
 * Cria uma conta Stripe Connect para instrutores
 */
export async function createConnectAccount(userId: string) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { userId },
    });

    // Atualiza o usuário com o ID da conta Stripe
    const { error } = await supabase
      .from('profiles')
      .update({ stripe_account_id: account.id })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    // Cria um link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${getBaseUrl()}/instructor/stripe/refresh`,
      return_url: `${getBaseUrl()}/instructor/stripe/complete`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  } catch (error) {
    console.error('Erro ao criar conta Connect:', error);
    throw error;
  }
}

/**
 * Processa eventos de webhook do Stripe
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdate(account);
        break;
      }
      // Adicione mais handlers de eventos conforme necessário
      default:
        console.log(`Evento não tratado: ${event.type}`);
    }
  } catch (error) {
    console.error(`Erro ao processar evento ${event.type}:`, error);
    throw error;
  }
}

/**
 * Processa um pagamento bem-sucedido
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const { productId, userId, instructorId } = session.metadata as {
    productId: string;
    userId: string;
    instructorId: string;
  };

  if (!productId || !userId) return;

  try {
    // Registra a compra no banco de dados
    const { error } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        product_id: productId,
        amount: session.amount_total || 0,
        stripe_session_id: session.id,
        status: 'completed',
      });

    if (error) throw error;

    // Conceder acesso ao curso
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: productId,
        enrolled_at: new Date().toISOString(),
        status: 'active',
      });

    if (enrollmentError) {
      console.error('Erro ao matricular usuário:', enrollmentError);
    }

    // Aqui você pode adicionar qualquer lógica adicional
    // como enviar e-mail de confirmação, etc.
  } catch (error) {
    console.error('Erro ao processar pagamento bem-sucedido:', error);
    throw error;
  }
}

/**
 * Processa atualizações de contas Stripe Connect
 */
async function handleAccountUpdate(account: Stripe.Account) {
  try {
    // Busca o usuário associado à conta Stripe
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_account_id', account.id)
      .single();

    if (error || !user) return;

    // Atualiza o status da conta do instrutor
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_account_enabled: account.charges_enabled,
        stripe_account_details_submitted: account.details_submitted,
      })
      .eq('id', user.id);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Erro ao processar atualização de conta:', error);
    throw error;
  }
}

/**
 * Recupera detalhes de uma sessão de checkout
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('Erro ao recuperar sessão:', error);
    throw error;
  }
}

/**
 * Obtém o link de login para a conta Stripe Connect do instrutor
 */
export async function getAccountLoginLink(accountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  } catch (error) {
    console.error('Erro ao criar link de login:', error);
    throw error;
  }
} 