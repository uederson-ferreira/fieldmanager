-- ===================================================================
-- CORREÇÃO DOS ERROS FINAIS - ECOFIELD SYSTEM
-- ===================================================================

-- PROBLEMA 1: RLS na tabela progresso_metas
-- PROBLEMA 2: Coluna 'foto' sendo incluída incorretamente em atividades_rotina

-- ===================================================================
-- 1. CORRIGIR POLÍTICAS RLS PARA PROGRESSO_METAS
-- ===================================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Admin pode gerenciar progresso" ON progresso_metas;
DROP POLICY IF EXISTS "TMA pode ver seu progresso" ON progresso_metas;

-- Criar política que permite inserção automática via triggers
CREATE POLICY "Permitir inserção automática progresso" ON progresso_metas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM', 'tma')
    )
  );

-- Política para visualização
CREATE POLICY "Visualização progresso metas" ON progresso_metas
  FOR SELECT USING (
    tma_id = auth.uid() OR
    tma_id IS NULL OR -- Progresso da equipe
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- Política para atualização
CREATE POLICY "Atualização progresso metas" ON progresso_metas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      JOIN perfis p ON u.perfil_id = p.id
      WHERE u.id = auth.uid() 
      AND p.nome IN ('admin', 'developer', 'ADM')
    )
  );

-- ===================================================================
-- 2. VERIFICAR E CORRIGIR FUNÇÃO DE CÁLCULO DE METAS
-- ===================================================================

-- Remover triggers existentes
DROP TRIGGER IF EXISTS trigger_calcular_progresso_termos ON termos_ambientais;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lvs ON lvs;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_lv_residuos ON lv_residuos;
DROP TRIGGER IF EXISTS trigger_calcular_progresso_rotinas ON atividades_rotina;

-- Remover função existente
DROP FUNCTION IF EXISTS calcular_progresso_metas();

-- Criar função corrigida (evitando ambiguidade)
CREATE OR REPLACE FUNCTION calcular_progresso_metas()
RETURNS TRIGGER AS $$
DECLARE
    usuario_id_atual UUID;
    meta_record RECORD;
    progresso_record RECORD;
    qtd_atual INTEGER; -- ✅ Renomeada para evitar ambiguidade
    percentual_alcancado DECIMAL(5,2);
    status_atual TEXT;
BEGIN
    -- Determinar o ID do usuário baseado na tabela que disparou o trigger
    CASE TG_TABLE_NAME
        WHEN 'termos_ambientais' THEN
            usuario_id_atual := NEW.emitido_por_usuario_id;
        WHEN 'lvs' THEN
            usuario_id_atual := NEW.usuario_id;
        WHEN 'lv_residuos' THEN
            usuario_id_atual := NEW.usuario_id;
        WHEN 'atividades_rotina' THEN
            usuario_id_atual := NEW.tma_responsavel_id;
        ELSE
            RETURN NEW;
    END CASE;
    
    -- Se não há usuário, não fazer nada
    IF usuario_id_atual IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Iterar por todas as metas ativas do tipo correspondente
    FOR meta_record IN 
        SELECT m.id, m.descricao, m.tipo_meta, m.escopo, m.meta_quantidade, 
               m.periodo, m.ano, m.mes, ma.meta_quantidade_individual
        FROM metas m
        LEFT JOIN metas_atribuicoes ma ON m.id = ma.meta_id AND ma.tma_id = usuario_id_atual
        WHERE m.ativa = true
        AND (
            (TG_TABLE_NAME = 'termos_ambientais' AND m.tipo_meta = 'termo') OR
            (TG_TABLE_NAME IN ('lvs', 'lv_residuos') AND m.tipo_meta = 'lv') OR
            (TG_TABLE_NAME = 'atividades_rotina' AND m.tipo_meta = 'rotina')
        )
        AND (
            (m.escopo = 'equipe') OR
            (m.escopo = 'individual' AND ma.tma_id = usuario_id_atual)
        )
    LOOP
        -- Calcular quantidade atual baseada no tipo de meta
        CASE meta_record.tipo_meta
            WHEN 'termo' THEN
                -- CORREÇÃO: Usar data_termo em vez de created_at
                SELECT COUNT(*) INTO qtd_atual
                FROM termos_ambientais ta
                WHERE ta.emitido_por_usuario_id = usuario_id_atual
                AND EXTRACT(YEAR FROM ta.data_termo) = meta_record.ano
                AND EXTRACT(MONTH FROM ta.data_termo) = meta_record.mes;
            WHEN 'lv' THEN
                -- Contar LVs normais e de resíduos
                SELECT COUNT(*) INTO qtd_atual
                FROM (
                    SELECT l.usuario_id, l.created_at FROM lvs l
                    WHERE l.usuario_id = usuario_id_atual
                    UNION ALL
                    SELECT lr.usuario_id, lr.created_at FROM lv_residuos lr
                    WHERE lr.usuario_id = usuario_id_atual
                ) as todas_lvs
                WHERE EXTRACT(YEAR FROM todas_lvs.created_at) = meta_record.ano
                AND EXTRACT(MONTH FROM todas_lvs.created_at) = meta_record.mes;
            WHEN 'rotina' THEN
                SELECT COUNT(*) INTO qtd_atual
                FROM atividades_rotina ar
                WHERE ar.tma_responsavel_id = usuario_id_atual
                AND EXTRACT(YEAR FROM ar.created_at) = meta_record.ano
                AND EXTRACT(MONTH FROM ar.created_at) = meta_record.mes;
            ELSE
                qtd_atual := 0;
        END CASE;
        
        -- Calcular percentual alcançado
        IF meta_record.escopo = 'individual' AND meta_record.meta_quantidade_individual IS NOT NULL THEN
            percentual_alcancado := (qtd_atual::DECIMAL / meta_record.meta_quantidade_individual) * 100;
        ELSE
            percentual_alcancado := (qtd_atual::DECIMAL / meta_record.meta_quantidade) * 100;
        END IF;
        
        -- Determinar status
        IF percentual_alcancado >= 100 THEN
            status_atual := 'alcancada';
        ELSIF percentual_alcancado >= 80 THEN
            status_atual := 'em_andamento';
        ELSE
            status_atual := 'em_andamento';
        END IF;
        
        -- Verificar se já existe progresso para esta meta e usuário
        SELECT pm.id INTO progresso_record
        FROM progresso_metas pm
        WHERE pm.meta_id = meta_record.id
        AND pm.tma_id = usuario_id_atual;
        
        -- Atualizar ou inserir progresso
        IF FOUND THEN
            UPDATE progresso_metas
            SET 
                quantidade_atual = qtd_atual, -- ✅ Usar variável renomeada
                percentual_alcancado = percentual_alcancado,
                status = status_atual,
                ultima_atualizacao = NOW()
            WHERE meta_id = meta_record.id
            AND tma_id = usuario_id_atual;
        ELSE
            INSERT INTO progresso_metas (
                meta_id,
                tma_id,
                periodo,
                ano,
                mes,
                quantidade_atual, -- ✅ Coluna da tabela
                percentual_alcancado,
                status,
                ultima_atualizacao
            ) VALUES (
                meta_record.id,
                usuario_id_atual,
                meta_record.periodo,
                meta_record.ano,
                meta_record.mes,
                qtd_atual, -- ✅ Usar variável renomeada
                percentual_alcancado,
                status_atual,
                NOW()
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar triggers
CREATE TRIGGER trigger_calcular_progresso_termos
    AFTER INSERT OR UPDATE ON termos_ambientais
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_lvs
    AFTER INSERT OR UPDATE ON lvs
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_lv_residuos
    AFTER INSERT OR UPDATE ON lv_residuos
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

CREATE TRIGGER trigger_calcular_progresso_rotinas
    AFTER INSERT OR UPDATE ON atividades_rotina
    FOR EACH ROW
    EXECUTE FUNCTION calcular_progresso_metas();

-- ===================================================================
-- 3. VERIFICAR SE FORAM CRIADOS
-- ===================================================================

-- Verificar triggers
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgname LIKE '%calcular_progresso%'
ORDER BY tgname;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'progresso_metas'
ORDER BY policyname;

-- ===================================================================
-- 4. TESTE DE FUNCIONAMENTO
-- ===================================================================

-- Teste: Verificar se uma atividade de rotina pode ser inserida
-- (comentado para não interferir com dados existentes)
/*
INSERT INTO atividades_rotina (
    data_atividade,
    area_id,
    atividade,
    tma_responsavel_id,
    encarregado_id,
    status
) VALUES (
    CURRENT_DATE,
    (SELECT id FROM areas LIMIT 1),
    'Teste de correção',
    (SELECT id FROM usuarios WHERE perfil_id = (SELECT id FROM perfis WHERE nome = 'tma') LIMIT 1),
    (SELECT id FROM usuarios WHERE perfil_id = (SELECT id FROM perfis WHERE nome = 'tma') LIMIT 1),
    'Planejada'
);
*/

-- Verificar se há progresso sendo calculado
SELECT 
    'PROGRESSO_METAS' as tabela,
    COUNT(*) as total_registros
FROM progresso_metas
UNION ALL
SELECT 
    'METAS' as tabela,
    COUNT(*) as total_registros
FROM metas
WHERE ativa = true;

-- ===================================================================
-- 5. INSTRUÇÕES PARA O FRONTEND
-- ===================================================================

/*
PROBLEMA 2: COLUNA 'FOTO' SENDO INCLUÍDA INCORRETAMENTE

O problema está no código TypeScript onde o objeto formData está sendo 
espalhado diretamente, incluindo a propriedade 'foto' que não existe na 
tabela atividades_rotina.

CORREÇÃO NECESSÁRIA NO FRONTEND:

No arquivo AtividadesRotina.tsx, linha ~672, alterar:

ANTES:
const offlineData = {
  ...formData,  // ❌ Isso inclui a propriedade 'foto'
  id: editingId || `temp_${Date.now()}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  offline_created: true,
  sync_error: (error as Error).message,
};

DEPOIS:
const { foto, ...formDataSemFoto } = formData; // ✅ Remover 'foto'
const offlineData = {
  ...formDataSemFoto,  // ✅ Sem a propriedade 'foto'
  id: editingId || `temp_${Date.now()}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  offline_created: true,
  sync_error: (error as Error).message,
};
*/ 