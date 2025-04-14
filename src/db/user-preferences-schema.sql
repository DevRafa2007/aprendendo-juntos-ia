-- Schema para preferências do usuário
-- Esta tabela armazena configurações e preferências personalizadas para cada usuário

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{
    "courseUpdates": true,
    "newMessages": true,
    "promotions": false,
    "newsletter": true,
    "completionReminders": true
  }',
  display_settings JSONB DEFAULT '{
    "darkMode": false,
    "fontSize": "medium",
    "language": "pt-BR"
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
);

-- Criar índice para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Políticas RLS para a tabela user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Política para selecionar apenas as próprias preferências
CREATE POLICY select_own_preferences ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para inserir preferências apenas para o próprio usuário
CREATE POLICY insert_own_preferences ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para atualizar apenas as próprias preferências
CREATE POLICY update_own_preferences ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_user_preferences_updated_at(); 