import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createCheckoutSession } from '@/services/stripeService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { courseId, userId, instructorId } = req.body;
    
    if (!courseId || !userId || !instructorId) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }
    
    // Criar sessão de checkout
    const session = await createCheckoutSession(courseId, userId, instructorId);
    
    // Retornar URL da sessão para redirecionamento
    return res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error);
    return res.status(500).json({ error: error.message });
  }
} 