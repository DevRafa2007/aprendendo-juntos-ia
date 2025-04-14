import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { handleWebhookEvent } from '@/services/stripeService';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  try {
    // Verificar a assinatura do webhook para garantir que é do Stripe
    const event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    
    // Processar o evento
    await handleWebhookEvent(event);
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook do Stripe:', error);
    return res.status(400).json({ 
      error: `Erro ao processar webhook: ${error.message}` 
    });
  }
} 