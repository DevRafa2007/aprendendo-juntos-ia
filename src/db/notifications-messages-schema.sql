-- Schema para notificações e mensagens
-- Este arquivo contém as tabelas necessárias para o sistema de notificações e mensagens

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'system', -- system, course, message, payment
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para conversas (agrupamento de mensagens)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Garantir que uma conversa entre os mesmos usuários seja única
  CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id),
  
  -- Garantir que user1_id é sempre menor que user2_id para evitar duplicações
  CONSTRAINT user_order CHECK (user1_id < user2_id)
);

-- Índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Habilitar Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificações
CREATE POLICY select_own_notifications ON notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY update_own_notifications ON notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para mensagens
CREATE POLICY select_own_messages ON messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY insert_own_messages ON messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY update_received_messages ON messages 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Políticas RLS para conversas
CREATE POLICY select_own_conversations ON conversations 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_notifications_timestamp
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_timestamp
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_timestamp
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar a conversa quando uma mensagem for enviada
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
  smaller_id UUID;
  larger_id UUID;
  conv_id UUID;
BEGIN
  -- Garantir a ordem dos IDs para evitar duplicações
  IF NEW.sender_id < NEW.receiver_id THEN
    smaller_id := NEW.sender_id;
    larger_id := NEW.receiver_id;
  ELSE
    smaller_id := NEW.receiver_id;
    larger_id := NEW.sender_id;
  END IF;
  
  -- Verificar se a conversa já existe
  SELECT id INTO conv_id FROM conversations 
  WHERE user1_id = smaller_id AND user2_id = larger_id;
  
  -- Se a conversa não existir, criar uma nova
  IF conv_id IS NULL THEN
    INSERT INTO conversations (user1_id, user2_id, last_message_id, updated_at)
    VALUES (smaller_id, larger_id, NEW.id, now())
    RETURNING id INTO conv_id;
  ELSE
    -- Atualizar a conversa existente
    UPDATE conversations
    SET last_message_id = NEW.id, updated_at = now()
    WHERE id = conv_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar a conversa quando uma mensagem for inserida
CREATE TRIGGER update_conversation_after_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message();

-- Funções para criar notificações de sistema
CREATE OR REPLACE FUNCTION create_system_notification(
  user_id UUID,
  title TEXT,
  message TEXT,
  action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, action_url)
  VALUES (user_id, title, message, 'system', action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação de nova mensagem
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    user_id, 
    title, 
    message, 
    type, 
    action_url
  )
  VALUES (
    NEW.receiver_id,
    'Nova mensagem',
    (SELECT name FROM profiles WHERE id = NEW.sender_id) || ' enviou uma mensagem para você.',
    'message',
    '/mensagens/' || NEW.sender_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificação quando uma mensagem for recebida
CREATE TRIGGER create_notification_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION create_message_notification();

-- Função para criar dados de exemplo para testes (somente em desenvolvimento)
CREATE OR REPLACE FUNCTION create_notification_sample_data(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Notificação de sistema
  INSERT INTO notifications (user_id, title, message, type, action_url)
  VALUES (
    user_id, 
    'Bem-vindo à plataforma!', 
    'Obrigado por se juntar a nós. Explore nossos cursos e comece a aprender hoje mesmo.', 
    'system',
    '/cursos'
  );
  
  -- Notificação de curso
  INSERT INTO notifications (user_id, title, message, type, action_url)
  VALUES (
    user_id, 
    'Novo curso disponível', 
    'O curso "Desenvolvimento Web Avançado" já está disponível na plataforma.', 
    'course',
    '/curso/1'
  );
  
  -- Notificação de pagamento
  INSERT INTO notifications (user_id, title, message, type, action_url)
  VALUES (
    user_id, 
    'Pagamento confirmado', 
    'Seu pagamento para o curso "React Avançado" foi confirmado. Você já pode acessar o conteúdo completo.', 
    'payment',
    '/meus-cursos'
  );
END;
$$ LANGUAGE plpgsql; 