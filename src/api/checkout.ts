import { createCheckoutSession } from '@/services/stripeService';

export async function createCheckoutSessionHandler(
  courseId: string,
  userId: string,
  instructorId: string
) {
  try {
    // Criar sessão de checkout
    const session = await createCheckoutSession(courseId, userId, instructorId);
    
    // Retornar dados da sessão
    return { 
      success: true,
      sessionId: session.id,
      url: session.url 
    };
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
} 