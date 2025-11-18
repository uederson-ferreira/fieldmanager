-- Executar trigger para emitido_por_usuario_id
-- Localização: sql/fixes/executar_trigger_emitido_por_usuario_id.sql

-- ✅ DROPAR trigger e função existentes (se houver)
DROP TRIGGER IF EXISTS trigger_preencher_emitido_por_usuario_id ON termos_ambientais;
DROP FUNCTION IF EXISTS preencher_emitido_por_usuario_id();

-- Função para preencher emitido_por_usuario_id
CREATE OR REPLACE FUNCTION preencher_emitido_por_usuario_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Se emitido_por_usuario_id está vazio e auth_user_id existe
  IF NEW.emitido_por_usuario_id IS NULL AND NEW.auth_user_id IS NOT NULL THEN
    -- Buscar o usuario_id correspondente ao auth_user_id
    SELECT id INTO NEW.emitido_por_usuario_id
    FROM usuarios 
    WHERE auth_user_id = NEW.auth_user_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trigger_preencher_emitido_por_usuario_id
  BEFORE INSERT OR UPDATE ON termos_ambientais
  FOR EACH ROW
  EXECUTE FUNCTION preencher_emitido_por_usuario_id();

-- Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_preencher_emitido_por_usuario_id';

-- Testar o trigger (opcional)
-- INSERT INTO termos_ambientais (auth_user_id, tipo_termo, ...) VALUES (...);
-- O trigger deve preencher automaticamente emitido_por_usuario_id 