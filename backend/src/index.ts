import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import uploadRouter from './routes/upload';
import versionRouter from './routes/version';
import perfisRouter from './routes/perfis';
import encarregadosRouter from './routes/encarregados';
import empresasRouter from './routes/empresas';
import areasRouter from './routes/areas';
import categoriasRouter from './routes/categorias';
import lvsRouter from './routes/lvs';
import metasRouter from './routes/metas';
import termosRouter from './routes/termos';
import configuracoesRouter from './routes/configuracoes';
import rotinasRouter from './routes/rotinas';
import logsRouter from './routes/logs';
import backupRouter from './routes/backup';
import estatisticasRouter from './routes/estatisticas';
import estatisticasUsuarioRouter from './routes/estatisticas-usuario';
import usuariosRouter from './routes/usuarios';
import fotosRouter from './routes/fotos';
import historicoRouter from './routes/historico';
import syncRouter from './routes/sync';
import authRouter from './routes/auth';
import acoesCorretivasRouter from './routes/acoesCorretivas';
import { getCurrentTimestamp } from './utils/dateUtils';

const app = express();
const PORT = process.env.PORT;

// ===================================================================
// CONFIGURAÇÃO CORS UNIFICADA - POR AMBIENTE
// ===================================================================

// 🔒 SEGURANÇA: Diferentes origens por ambiente
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      // Apenas origens de produção
      'https://ecofield.vercel.app',
      'https://ecofield-git-main-uederson.vercel.app'
    ]
  : [
      // Desenvolvimento: incluir localhost
      'http://localhost:3000',
      'http://localhost:5173',
      'https://ecofield.vercel.app', // Para testar com produção
      'https://ecofield-git-main-uederson.vercel.app'
    ];

console.log(`🌐 [CORS] Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 [CORS] Origens permitidas:`, allowedOrigins);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// ✅ LOG DE DEBUG CORS
app.use((req, res, next) => {
  if (req.method === 'OPTIONS' || req.path.includes('/auth/')) {
    console.log(`🌐 [CORS] ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  }
  next();
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ===================================================================
// MIDDLEWARES GERAIS
// ===================================================================

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ===================================================================
// RATE LIMITING - PROTEÇÃO CONTRA ATAQUES
// ===================================================================

// 🔒 Rate limiter para login - Proteção contra força bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login. Por favor, aguarde 15 minutos e tente novamente.'
  },
  standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skipSuccessfulRequests: false, // Contar tentativas bem-sucedidas também
  handler: (req, res) => {
    console.warn(`⚠️ [RATE LIMIT] Bloqueado login de IP: ${req.ip}`);
    res.status(429).json({
      error: 'Muitas tentativas de login. Por favor, aguarde 15 minutos e tente novamente.',
      retryAfter: 900 // 15 minutos em segundos
    });
  }
});

// 🔒 Rate limiter geral para API - Proteção contra DoS
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por IP por minuto
  message: {
    error: 'Muitas requisições. Por favor, aguarde um momento.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.warn(`⚠️ [RATE LIMIT] Bloqueado requisição de IP: ${req.ip} para ${req.path}`);
    res.status(429).json({
      error: 'Muitas requisições. Por favor, aguarde um momento.',
      retryAfter: 60
    });
  }
});

// Aplicar rate limiter específico para rotas de autenticação
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);

// Aplicar rate limiter geral para todas as rotas da API (exceto health check)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    next(); // Pular rate limit para health check
  } else {
    apiLimiter(req, res, next);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: getCurrentTimestamp(),
    service: 'ecofield-backend',
    version: '1.0.0',
    port: PORT,
    cors: 'enabled'
  });
});

// ===================================================================
// ROTAS DA API
// ===================================================================

app.use('/api', uploadRouter);
app.use('/api/perfis', perfisRouter);
app.use('/api/encarregados', encarregadosRouter);
app.use('/api/empresas', empresasRouter);
app.use('/api/areas', areasRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/lvs', lvsRouter);
app.use('/api/metas', metasRouter);
app.use('/api/termos', termosRouter);
app.use('/api/configuracoes', configuracoesRouter);
app.use('/api/rotinas', rotinasRouter);
app.use('/api/logs', logsRouter);
app.use('/api/backup', backupRouter);
app.use('/api/estatisticas', estatisticasRouter);
app.use('/api/estatisticas', estatisticasUsuarioRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/fotos', fotosRouter);
app.use('/api/historico', historicoRouter);
app.use('/api/sync', syncRouter);
app.use('/api/auth', authRouter);
app.use('/api/acoes-corretivas', acoesCorretivasRouter);
app.use('/', versionRouter);

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'EcoField Backend API',
    status: 'running',
    timestamp: getCurrentTimestamp(),
    cors: 'configured'
  });
});

// ===================================================================
// TRATAMENTO DE ERROS
// ===================================================================

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('💥 [APP] Erro na aplicação:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Rota 404
app.use('*', (req, res) => {
  console.log(`❓ [404] Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

// ===================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ===================================================================

app.listen(PORT, () => {
  const baseUrl = process.env.API_URL || `http://localhost:${PORT}`;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  console.log(`🚀 [SERVER] Backend rodando na porta ${PORT}`);
  console.log(`📊 [HEALTH] Health check: ${cleanBaseUrl}/api/health`);
  console.log(`🌐 [CORS] Configurado para Vercel e localhost`);
  console.log(`🔗 [URL] Base URL: ${cleanBaseUrl}`);
});