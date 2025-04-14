# Configuração do Stripe em Produção

Este documento fornece instruções para configurar o Stripe em ambiente de produção para a plataforma Aprendendo Juntos.

## Pré-requisitos

1. Uma conta Stripe ativa no modo de produção
2. Acesso ao painel administrativo do Stripe
3. Permissões adequadas para configurar webhooks e API keys

## Passo a Passo

### 1. Obter Chaves de API

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Vá em Developers > API keys
3. Copie as seguintes chaves:
   - **Publishable Key** (`VITE_STRIPE_PUBLISHABLE_KEY`)
   - **Secret Key** (`STRIPE_SECRET_KEY`)

### 2. Configurar Webhook

1. Ainda no Dashboard do Stripe, vá para Developers > Webhooks
2. Clique em "Add endpoint"
3. Configure o endpoint com a URL da sua aplicação:
   ```
   https://seudominio.com/api/webhooks/stripe
   ```
4. Selecione os seguintes eventos:
   - `checkout.session.completed`
   - `account.updated`
   - (Adicione outros eventos necessários, conforme implementação)
5. Após criar o webhook, copie o "Signing Secret" (`STRIPE_WEBHOOK_SECRET`)

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu ambiente de produção:

```
# Stripe (Produção)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Configurações da Aplicação
NEXT_PUBLIC_BASE_URL=https://seudominio.com
NEXT_PUBLIC_API_URL=https://seudominio.com/api
```

### 4. Configurar Stripe Connect (Para pagamentos para instrutores)

1. No Dashboard do Stripe, vá para Connect > Settings
2. Configure as URLs de redirecionamento:
   - **Redirect URLs**: 
     ```
     https://seudominio.com/instrutor/stripe/complete,
     https://seudominio.com/instrutor/stripe/refresh
     ```

### 5. Testes em Produção

Antes de disponibilizar para usuários reais, faça um teste completo:

1. Crie um produto de teste com valor baixo
2. Realize uma compra completa
3. Verifique nos logs se os webhooks foram recebidos corretamente
4. Confirme que o acesso ao conteúdo foi liberado após o pagamento

### 6. Lembre-se

- **Nunca** exponha a chave secreta (`STRIPE_SECRET_KEY`) no frontend
- Mantenha o webhook secret (`STRIPE_WEBHOOK_SECRET`) seguro
- Configure notificações no Stripe para falhas de webhook
- Implemente logs detalhados para solução de problemas
- Considere implementar um sistema de retry para webhooks falhados

## Recursos Adicionais

- [Documentação do Stripe](https://stripe.com/docs)
- [Webhooks do Stripe](https://stripe.com/docs/webhooks)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Checkout](https://stripe.com/docs/payments/checkout)

## Suporte

Para problemas com a integração, verifique:

1. Logs do servidor para erros de webhook
2. Painel do Stripe para falhas em webhooks
3. Eventos no Stripe para rastrear pagamentos
4. Status das transações no Dashboard do Stripe 