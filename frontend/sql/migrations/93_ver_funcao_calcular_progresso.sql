-- Ver o código EXATO da função no banco
SELECT
    p.proname as function_name,
    p.prosrc as source_code
FROM pg_proc p
WHERE p.proname = 'calcular_progresso_metas';
