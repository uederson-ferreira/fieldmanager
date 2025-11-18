import { Router } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

// Interface para resposta da versão
interface VersionResponse {
  current: string;
  latest: string;
  buildDate: string;
  changelog?: string;
  forceUpdate?: boolean;
}

// Função para ler package.json
const getPackageVersion = (): string => {
  try {
    const packagePath = join(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    console.error('Erro ao ler package.json:', error);
    return '1.0.0';
  }
};

// Função para gerar changelog baseado na versão
const getChangelog = (version: string): string => {
  const changelogs: Record<string, string> = {
    '1.0.0': 'Versão inicial do EcoField',
    '1.1.0': 'Sistema de metas implementado',
    '1.2.0': 'Melhorias no sistema offline',
    '1.3.0': 'Correções de performance e bugs',
    '1.4.0': 'Sistema de verificação de versão automática',
    '1.4.1': 'Correções no sistema de fotos e melhorias gerais'
  };
  
  return changelogs[version] || 'Atualizações gerais de sistema';
};

// Rota principal de verificação de versão
router.get('/api/version', (req, res) => {
  try {
    const currentVersion = getPackageVersion();
    const buildDate = new Date().toISOString();
    
    // Determinar se é uma atualização forçada (versões críticas)
    const forceUpdateVersions = ['1.4.0']; // Versões que requerem atualização forçada
    const forceUpdate = forceUpdateVersions.includes(currentVersion);
    
    // Simular uma versão mais recente disponível (para teste)
    // Em produção, isso viria de um banco de dados ou arquivo de configuração
    const latestVersion = '1.4.1'; // Versão mais recente disponível
    
    // Verificar se o cliente está pedindo uma versão específica (para simular atualização)
    const clientVersion = req.headers['x-client-version'];
    if (clientVersion === latestVersion) {
      // Cliente já está na versão mais recente
      const versionResponse: VersionResponse = {
        current: latestVersion,
        latest: latestVersion,
        buildDate,
        changelog: getChangelog(latestVersion),
        forceUpdate: false
      };
      res.json(versionResponse);
      return;
    }
    
    const versionResponse: VersionResponse = {
      current: currentVersion,
      latest: latestVersion, // Versão mais recente disponível
      buildDate,
      changelog: getChangelog(latestVersion),
      forceUpdate: false // Não forçar atualização para esta versão
    };
    
    // Headers para evitar cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json(versionResponse);
    
  } catch (error) {
    console.error('Erro na verificação de versão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível verificar a versão'
    });
  }
});

// Rota para forçar atualização (para casos críticos)
router.post('/api/version/force-update', (req, res) => {
  try {
    const { version, reason } = req.body;
    
    // Aqui você poderia implementar lógica para forçar atualização
    // Por exemplo, marcar uma versão como crítica no banco de dados
    
    res.json({
      success: true,
      message: `Atualização forçada configurada para versão ${version}`,
      reason
    });
    
  } catch (error) {
    console.error('Erro ao configurar atualização forçada:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível configurar atualização forçada'
    });
  }
});

export default router; 