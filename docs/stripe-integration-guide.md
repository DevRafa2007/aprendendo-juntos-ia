# Guia de Integração do Stripe

Este documento descreve como a integração do Stripe foi implementada na plataforma Aprendendo Juntos para processamento de pagamentos.

## Configuração do Ambiente

As seguintes variáveis de ambiente são necessárias para a integração:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...   # Chave publicável para o frontend
STRIPE_SECRET_KEY=sk_test_...             # Chave secreta para o backend
STRIPE_WEBHOOK_SECRET=whsec_...           # Chave para verificação de webhooks
```

> **Importante:** Utilizar chaves de teste durante o desenvolvimento e chaves de produção em ambiente de produção.

## Estrutura da Implementação

O serviço Stripe está implementado em `src/services/stripeService.ts` e contém as seguintes funcionalidades:

### 1. Para Instrutores (Stripe Connect)

- **Criação de conta Connect**: Permite aos instrutores receberem pagamentos diretamente
- **Gerenciamento de status da conta**: Verificação do processo de onboarding e habilitação de pagamentos
- **Listagem de transações e pagamentos**: Histórico financeiro do instrutor

### 2. Para Produtos (Cursos)

- **Criação de produtos**: Registra cursos como produtos no Stripe
- **Atualização de produtos**: Permite alterar preços e status de disponibilidade
- **Listagem de produtos**: Obtém todos os produtos registrados

### 3. Para Checkout e Pagamentos

- **Criação de sessão de checkout**: Cria um link de pagamento para compra de cursos
- **Verificação de status do pagamento**: Confirma se um pagamento foi concluído

### 4. Para Webhooks

- **Processamento de eventos**: Trata eventos como conclusão de pagamento, atualização de conta, etc.

## Modelo de Dados (Supabase)

A implementação utiliza as seguintes tabelas no Supabase:

1. `stripe_accounts`: Armazena informações das contas Connect dos instrutores
2. `stripe_products`: Mapeia cursos para produtos e preços no Stripe
3. `stripe_transactions`: Registra transações de pagamento 
4. `user_courses`: Registra acesso aos cursos após pagamento confirmado

## Fluxo de Pagamento

1. **Criação do produto**: Quando um instrutor cria um curso, um produto é criado no Stripe
2. **Compra do curso**: O usuário clica em "Comprar" e é redirecionado para o checkout do Stripe
3. **Webhook de confirmação**: O Stripe notifica a plataforma quando o pagamento é confirmado
4. **Liberação do acesso**: O usuário é adicionado ao curso após confirmação do pagamento
5. **Divisão da receita**: O valor é dividido entre o instrutor (ex: 80%) e a plataforma (ex: 20%)

## Testes

Para testar a integração em ambiente de desenvolvimento:

1. Use cartões de teste do Stripe (ex: 4242 4242 4242 4242)
2. Teste o fluxo completo de criação de conta Connect
3. Verifique a recepção correta de webhooks usando o CLI do Stripe:
   ```
   stripe listen --forward-to http://localhost:5173/api/webhooks/stripe
   ```

## Resolução de Problemas

- Verifique os logs para erros específicos do Stripe
- Consulte o painel do Stripe para verificar o status das transações
- Certifique-se de que as webhooks estão configuradas corretamente

## Referências

- [Documentação oficial do Stripe](https://stripe.com/docs)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Webhooks do Stripe](https://stripe.com/docs/webhooks) 