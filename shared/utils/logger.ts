// Structured Logging System - Centralized logging for all game modules
// Provides consistent, searchable logs across client and server

import { DEBUG_CONFIG } from '../config/game-config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  playerId?: string;
  sessionId?: string;
  requestId?: string;
}

export class Logger {
  private static level: LogLevel = Logger.parseLogLevel(DEBUG_CONFIG.LOG_LEVEL);
  private static sessionId: string = Logger.generateSessionId();
  private static listeners: ((entry: LogEntry) => void)[] = [];

  private static parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private static generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  static setLevel(level: LogLevel): void {
    Logger.level = level;
  }

  static addListener(listener: (entry: LogEntry) => void): () => void {
    Logger.listeners.push(listener);
    return () => {
      const index = Logger.listeners.indexOf(listener);
      if (index > -1) {
        Logger.listeners.splice(index, 1);
      }
    };
  }

  private static createEntry(
    level: LogLevel, 
    module: string, 
    message: string, 
    data?: any,
    context?: { playerId?: string; requestId?: string }
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      playerId: context?.playerId,
      sessionId: Logger.sessionId,
      requestId: context?.requestId
    };
  }

  private static log(
    level: LogLevel, 
    module: string, 
    message: string, 
    data?: any,
    context?: { playerId?: string; requestId?: string }
  ): void {
    if (level < Logger.level) return;

    const entry = Logger.createEntry(level, module, message, data, context);
    
    // Console output with colors
    const levelName = LogLevel[level];
    const color = Logger.getLevelColor(level);
    const playerInfo = entry.playerId ? ` [${entry.playerId.substring(0, 8)}]` : '';
    const prefix = `${entry.timestamp} ${color}[${levelName}]${Logger.colors.reset} [${module}]${playerInfo}`;

    if (data !== undefined) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }

    // Notify listeners
    Logger.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (error) {
        console.error('Logger listener error:', error);
      }
    });
  }

  private static getLevelColor(level: LogLevel): string {
    if (!DEBUG_CONFIG.ENABLED) return '';
    
    switch (level) {
      case LogLevel.DEBUG: return Logger.colors.gray;
      case LogLevel.INFO: return Logger.colors.blue;
      case LogLevel.WARN: return Logger.colors.yellow;
      case LogLevel.ERROR: return Logger.colors.red;
      default: return '';
    }
  }

  private static colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m'
  };

  // Public logging methods
  static debug(
    module: string, 
    message: string, 
    data?: any,
    context?: { playerId?: string; requestId?: string }
  ): void {
    Logger.log(LogLevel.DEBUG, module, message, data, context);
  }

  static info(
    module: string, 
    message: string, 
    data?: any,
    context?: { playerId?: string; requestId?: string }
  ): void {
    Logger.log(LogLevel.INFO, module, message, data, context);
  }

  static warn(
    module: string, 
    message: string, 
    data?: any,
    context?: { playerId?: string; requestId?: string }
  ): void {
    Logger.log(LogLevel.WARN, module, message, data, context);
  }

  static error(
    module: string, 
    message: string, 
    data?: any,
    context?: { playerId?: string; requestId?: string }
  ): void {
    Logger.log(LogLevel.ERROR, module, message, data, context);
  }

  // Specialized logging methods for game events
  static playerAction(
    playerId: string, 
    action: string, 
    details?: any,
    context?: { requestId?: string }
  ): void {
    Logger.info('PLAYER_ACTION', `${action}`, details, { ...context, playerId });
  }

  static apiRequest(
    method: string, 
    path: string, 
    statusCode: number, 
    duration: number,
    playerId?: string,
    requestId?: string
  ): void {
    const message = `${method} ${path} ${statusCode} in ${duration}ms`;
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    Logger.log(level, 'API', message, undefined, { playerId, requestId });
  }

  static websocketEvent(
    event: string, 
    playerId?: string, 
    data?: any
  ): void {
    if (DEBUG_CONFIG.VERBOSE_WEBSOCKET) {
      Logger.debug('WEBSOCKET', event, data, { playerId });
    } else {
      Logger.info('WEBSOCKET', event, undefined, { playerId });
    }
  }

  static gameEvent(
    event: string, 
    playerId: string, 
    data?: any
  ): void {
    Logger.info('GAME_EVENT', event, data, { playerId });
  }

  static performance(
    operation: string, 
    duration: number, 
    details?: any
  ): void {
    if (DEBUG_CONFIG.PERFORMANCE_MONITORING) {
      Logger.debug('PERFORMANCE', `${operation} took ${duration}ms`, details);
    }
  }

  static security(
    event: string, 
    details: any, 
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    const level = severity === 'high' ? LogLevel.ERROR : LogLevel.WARN;
    Logger.log(level, 'SECURITY', event, details);
  }

  // Utility methods
  static withContext(playerId?: string, requestId?: string) {
    return {
      debug: (module: string, message: string, data?: any) => 
        Logger.debug(module, message, data, { playerId, requestId }),
      info: (module: string, message: string, data?: any) => 
        Logger.info(module, message, data, { playerId, requestId }),
      warn: (module: string, message: string, data?: any) => 
        Logger.warn(module, message, data, { playerId, requestId }),
      error: (module: string, message: string, data?: any) => 
        Logger.error(module, message, data, { playerId, requestId })
    };
  }

  static createRequestLogger(requestId: string) {
    return {
      playerAction: (playerId: string, action: string, details?: any) =>
        Logger.playerAction(playerId, action, details, { requestId }),
      apiRequest: (method: string, path: string, statusCode: number, duration: number, playerId?: string) =>
        Logger.apiRequest(method, path, statusCode, duration, playerId, requestId),
      debug: (module: string, message: string, data?: any, playerId?: string) =>
        Logger.debug(module, message, data, { playerId, requestId }),
      info: (module: string, message: string, data?: any, playerId?: string) =>
        Logger.info(module, message, data, { playerId, requestId }),
      warn: (module: string, message: string, data?: any, playerId?: string) =>
        Logger.warn(module, message, data, { playerId, requestId }),
      error: (module: string, message: string, data?: any, playerId?: string) =>
        Logger.error(module, message, data, { playerId, requestId })
    };
  }
}

// Export convenience functions
export const log = Logger;
export const createLogger = (module: string) => ({
  debug: (message: string, data?: any, context?: { playerId?: string; requestId?: string }) =>
    Logger.debug(module, message, data, context),
  info: (message: string, data?: any, context?: { playerId?: string; requestId?: string }) =>
    Logger.info(module, message, data, context),
  warn: (message: string, data?: any, context?: { playerId?: string; requestId?: string }) =>
    Logger.warn(module, message, data, context),
  error: (message: string, data?: any, context?: { playerId?: string; requestId?: string }) =>
    Logger.error(module, message, data, context)
});

// Export default logger
export default Logger;