-- Schema para integração com Stripe
-- Este arquivo contém as tabelas necessárias para gerenciar pagamentos via Stripe

-- Tabela para conectar usuários com contas Stripe (para professores)
CREATE TABLE IF NOT EXISTS stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL, -- ID da conta Stripe Connect do professor
  account_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_payout_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT stripe_accounts_user_id_unique UNIQUE (user_id),
  CONSTRAINT stripe_accounts_stripe_id_unique UNIQUE (stripe_account_id)
);

-- Tabela para armazenar produtos (cursos) no Stripe
CREATE TABLE IF NOT EXISTS stripe_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  stripe_product_id TEXT NOT NULL, -- ID do produto no Stripe
  stripe_price_id TEXT NOT NULL, -- ID do preço principal no Stripe
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT stripe_products_course_id_unique UNIQUE (course_id),
  CONSTRAINT stripe_products_stripe_product_id_unique UNIQUE (stripe_product_id)
);

-- Tabela para armazenar transações de pagamento
CREATE TABLE IF NOT EXISTS stripe_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  instructor_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_checkout_id TEXT,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, succeeded, failed, refunded
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT stripe_transactions_checkout_id_unique UNIQUE (stripe_checkout_id),
  CONSTRAINT stripe_transactions_payment_intent_unique UNIQUE (stripe_payment_intent_id)
);

-- Tabela para comissões e transferências para instrutores
CREATE TABLE IF NOT EXISTS instructor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_account_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed
  payout_id TEXT,
  payout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Apenas referencia stripe_account_id sem constraint CHECK com subconsulta
  FOREIGN KEY (stripe_account_id) REFERENCES stripe_accounts(stripe_account_id)
);

-- Criar uma função de validação para verificar se o instructor_id corresponde ao user_id na stripe_accounts
CREATE OR REPLACE FUNCTION check_instructor_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM stripe_accounts 
    WHERE stripe_accounts.stripe_account_id = NEW.stripe_account_id 
    AND stripe_accounts.user_id = NEW.instructor_id
  ) THEN
    RAISE EXCEPTION 'O instrutor não é o proprietário da conta Stripe informada';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar a correspondência entre instructor_id e user_id
CREATE TRIGGER validate_instructor_account
BEFORE INSERT OR UPDATE ON instructor_payouts
FOR EACH ROW
EXECUTE FUNCTION check_instructor_account();

-- Tabela para relacionar transações a matrículas
CREATE TABLE IF NOT EXISTS enrollment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES stripe_transactions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT enrollment_transactions_unique UNIQUE (enrollment_id, transaction_id)
);

-- Tabela para registrar webhooks do Stripe
CREATE TABLE IF NOT EXISTS stripe_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL,
  stripe_event_type TEXT NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT stripe_webhooks_event_id_unique UNIQUE (stripe_event_id)
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_user_id ON stripe_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_products_course_id ON stripe_products(course_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_user_id ON stripe_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_course_id ON stripe_transactions(course_id);
CREATE INDEX IF NOT EXISTS idx_stripe_transactions_instructor_id ON stripe_transactions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_payouts_instructor_id ON instructor_payouts(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_payouts_stripe_account_id ON instructor_payouts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_transactions_enrollment_id ON enrollment_transactions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event_type ON stripe_webhooks(stripe_event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_processed ON stripe_webhooks(processed);

-- Políticas RLS para as tabelas
ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas para stripe_accounts
CREATE POLICY select_own_stripe_account ON stripe_accounts
  FOR SELECT
  USING (auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM courses WHERE instructor_id = auth.uid() AND id IN 
                (SELECT course_id FROM stripe_products)));

-- Políticas para stripe_products
CREATE POLICY select_any_stripe_product ON stripe_products
  FOR SELECT
  USING (true);

CREATE POLICY insert_update_own_product ON stripe_products
  FOR ALL
  USING (EXISTS (SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid()));

-- Políticas para stripe_transactions
CREATE POLICY select_own_transactions ON stripe_transactions
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = instructor_id);

-- Políticas para instructor_payouts
CREATE POLICY select_own_payouts ON instructor_payouts
  FOR SELECT
  USING (auth.uid() = instructor_id);

-- Triggers para atualização de timestamps
CREATE OR REPLACE FUNCTION update_stripe_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stripe_accounts_timestamp
BEFORE UPDATE ON stripe_accounts
FOR EACH ROW
EXECUTE FUNCTION update_stripe_timestamp();

CREATE TRIGGER update_stripe_products_timestamp
BEFORE UPDATE ON stripe_products
FOR EACH ROW
EXECUTE FUNCTION update_stripe_timestamp();

CREATE TRIGGER update_stripe_transactions_timestamp
BEFORE UPDATE ON stripe_transactions
FOR EACH ROW
EXECUTE FUNCTION update_stripe_timestamp();

CREATE TRIGGER update_instructor_payouts_timestamp
BEFORE UPDATE ON instructor_payouts
FOR EACH ROW
EXECUTE FUNCTION update_stripe_timestamp(); 