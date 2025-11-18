// ===================================================================
// SISTEMA DE LOGS ESTRUTURADO - ECOFIELD SYSTEM
// Localização: src/utils/logger.ts
// ===================================================================

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'performance';

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const component = context?.component ? `[${context.component}]` : '';
    const action = context?.action ? `[${context.action}]` : '';
    const userId = context?.userId ? `[user:${context.userId}]` : '';
    
    return `${this.getEmoji(level)} [${timestamp}] ${component} ${action} ${userId} ${message}`;
  }

  private getEmoji(level: LogLevel): string {
    const emojis = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
      performance: '⚡'
    };
    return emojis[level];
  }

  private shouldLog(level: LogLevel): boolean {
    // Em produção, não logar debug
    if (this.isProduction && level === 'debug') return false;
    return true;
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, context), context?.data);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context), context?.data);
  }

  error(message: string, error?: any, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, context), { error, context });
    
    // Em produção, enviar para serviço de monitoramento
    if (this.isProduction) {
      this.sendToMonitoring({ level: 'error', message, error, context });
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.log(this.formatMessage('debug', message, context), context?.data);
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    if (!this.shouldLog('performance')) return;
    console.log(this.formatMessage('performance', `${operation}: ${duration}ms`, context));
    
    // Alertar se performance estiver ruim
    if (duration > 5000) {
      this.warn(`Performance lenta: ${operation} levou ${duration}ms`, context);
    }
  }

  private sendToMonitoring(data: any): void {
    // Implementar envio para serviço de monitoramento
    // Ex: Sentry, LogRocket, etc.
    try {
      // fetch('/api/logs', { method: 'POST', body: JSON.stringify(data) });
    } catch (error) {
      console.error('Erro ao enviar log para monitoramento:', error);
    }
  }

  // Métodos específicos para componentes
  component(componentName: string) {
    return {
      info: (message: string, context?: Omit<LogContext, 'component'>) => 
        this.info(message, { ...context, component: componentName }),
      warn: (message: string, context?: Omit<LogContext, 'component'>) => 
        this.warn(message, { ...context, component: componentName }),
      error: (message: string, error?: any, context?: Omit<LogContext, 'component'>) => 
        this.error(message, error, { ...context, component: componentName }),
      debug: (message: string, context?: Omit<LogContext, 'component'>) => 
        this.debug(message, { ...context, component: componentName }),
      performance: (operation: string, duration: number, context?: Omit<LogContext, 'component'>) => 
        this.performance(operation, duration, { ...context, component: componentName })
    };
  }
}

export const logger = new Logger(); 