/**
 * ENHANCED ERROR HANDLING SYSTEM
 * Unified error management with proper logging and user feedback
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  EXTERNAL_API = 'external_api'
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  additionalData?: Record<string, any>;
  timestamp?: Date;
}

export class GameError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly userMessage: string;
  public readonly technicalMessage: string;
  public readonly errorCode: string;

  constructor(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context: ErrorContext = {},
    userMessage?: string,
    errorCode?: string
  ) {
    super(message);
    this.name = 'GameError';
    this.severity = severity;
    this.category = category;
    this.context = { ...context, timestamp: new Date() };
    this.technicalMessage = message;
    this.userMessage = userMessage || this.getDefaultUserMessage();
    this.errorCode = errorCode || this.generateErrorCode();
  }

  private getDefaultUserMessage(): string {
    switch (this.category) {
      case ErrorCategory.VALIDATION:
        return 'Os dados fornecidos são inválidos. Verifique e tente novamente.';
      case ErrorCategory.NETWORK:
        return 'Problema de conexão. Verifique sua internet e tente novamente.';
      case ErrorCategory.DATABASE:
        return 'Erro ao salvar dados. Tente novamente em alguns instantes.';
      case ErrorCategory.AUTHENTICATION:
        return 'Sessão expirada. Faça login novamente.';
      case ErrorCategory.PERMISSION:
        return 'Você não tem permissão para esta ação.';
      case ErrorCategory.BUSINESS_LOGIC:
        return 'Esta ação não pode ser realizada no momento.';
      case ErrorCategory.EXTERNAL_API:
        return 'Serviço temporariamente indisponível. Tente novamente.';
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }

  private generateErrorCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${this.category.toUpperCase()}_${timestamp}_${random}`.toUpperCase();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.technicalMessage,
      userMessage: this.userMessage,
      severity: this.severity,
      category: this.category,
      errorCode: this.errorCode,
      context: this.context,
      stack: this.stack
    };
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: GameError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: GameError | Error): void {
    const gameError = error instanceof GameError ? error : this.wrapError(error);
    
    // Store in memory (in production, would send to logging service)
    this.errorLog.push(gameError);
    
    // Log to console with appropriate level
    switch (gameError.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(`[CRITICAL] ${gameError.errorCode}:`, gameError.toJSON());
        break;
      case ErrorSeverity.HIGH:
        console.error(`[ERROR] ${gameError.errorCode}:`, gameError.technicalMessage);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(`[WARNING] ${gameError.errorCode}:`, gameError.technicalMessage);
        break;
      case ErrorSeverity.LOW:
        console.info(`[INFO] ${gameError.errorCode}:`, gameError.technicalMessage);
        break;
    }

    // Keep only last 100 errors in memory
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  private wrapError(error: Error, context: ErrorContext = {}): GameError {
    let category = ErrorCategory.SYSTEM;
    let severity = ErrorSeverity.MEDIUM;

    // Try to categorize based on error message
    const message = error.message.toLowerCase();
    if (message.includes('validation') || message.includes('invalid')) {
      category = ErrorCategory.VALIDATION;
    } else if (message.includes('network') || message.includes('timeout')) {
      category = ErrorCategory.NETWORK;
    } else if (message.includes('database') || message.includes('storage')) {
      category = ErrorCategory.DATABASE;
    } else if (message.includes('permission') || message.includes('forbidden')) {
      category = ErrorCategory.PERMISSION;
    }

    return new GameError(error.message, severity, category, context);
  }

  getRecentErrors(limit: number = 10): GameError[] {
    return this.errorLog.slice(-limit);
  }

  clearErrors(): void {
    this.errorLog = [];
  }

  // Express middleware factory
  static createExpressHandler() {
    return (error: any, req: any, res: any, next: any) => {
      const handler = ErrorHandler.getInstance();
      
      const context: ErrorContext = {
        action: `${req.method} ${req.path}`,
        component: 'api',
        additionalData: {
          body: req.body,
          params: req.params,
          query: req.query,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        }
      };

      const gameError = error instanceof GameError ? error : handler.wrapError(error, context);
      handler.logError(gameError);

      // Send appropriate response
      const statusCode = ErrorHandler.getHttpStatusCode(gameError.category);
      res.status(statusCode).json({
        success: false,
        error: gameError.userMessage,
        errorCode: gameError.errorCode,
        ...(process.env.NODE_ENV === 'development' && {
          technicalMessage: gameError.technicalMessage,
          stack: gameError.stack
        })
      });
    };
  }

  private static getHttpStatusCode(category: ErrorCategory): number {
    switch (category) {
      case ErrorCategory.VALIDATION:
        return 400;
      case ErrorCategory.AUTHENTICATION:
        return 401;
      case ErrorCategory.PERMISSION:
        return 403;
      case ErrorCategory.NETWORK:
      case ErrorCategory.EXTERNAL_API:
        return 503;
      case ErrorCategory.DATABASE:
      case ErrorCategory.SYSTEM:
        return 500;
      default:
        return 500;
    }
  }
}

// Utility functions for common error scenarios
export const createValidationError = (message: string, context?: ErrorContext) => 
  new GameError(message, ErrorSeverity.LOW, ErrorCategory.VALIDATION, context);

export const createNetworkError = (message: string, context?: ErrorContext) => 
  new GameError(message, ErrorSeverity.MEDIUM, ErrorCategory.NETWORK, context);

export const createDatabaseError = (message: string, context?: ErrorContext) => 
  new GameError(message, ErrorSeverity.HIGH, ErrorCategory.DATABASE, context);

export const createBusinessLogicError = (message: string, context?: ErrorContext, userMessage?: string) => 
  new GameError(message, ErrorSeverity.MEDIUM, ErrorCategory.BUSINESS_LOGIC, context, userMessage);

export const createCriticalError = (message: string, context?: ErrorContext) => 
  new GameError(message, ErrorSeverity.CRITICAL, ErrorCategory.SYSTEM, context);