/**
 * Logger Utility
 * Centralized logging with support for external services
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userId?: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  /**
   * Info level logging
   */
  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: any) {
    this.log('error', message, error);
    
    // Send errors to external service (Sentry, LogRocket, etc.)
    if (this.isProduction && window.Sentry) {
      window.Sentry.captureException(error, {
        extra: { message, context: error }
      });
    }
  }

  /**
   * Debug level logging (only in development)
   */
  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      this.log('debug', message, data);
    }
  }

  /**
   * Log API calls
   */
  api(method: string, url: string, status: number, duration: number, error?: any) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    const message = `API ${method} ${url} - ${status} (${duration}ms)`;
    this.log(level, message, { method, url, status, duration, error });
  }

  /**
   * Log user actions
   */
  userAction(action: string, data?: any) {
    this.log('info', `User Action: ${action}`, data);
    
    // Send to analytics
    if (this.isProduction && window.analytics) {
      window.analytics.track(action, data);
    }
  }

  /**
   * Log page views
   */
  pageView(page: string, data?: any) {
    this.log('info', `Page View: ${page}`, data);
    
    // Send to analytics
    if (this.isProduction && window.analytics) {
      window.analytics.page(page, data);
    }
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Console output (formatted for development)
    if (this.isDevelopment) {
      const styles = this.getConsoleStyles(level);
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `%c[${level.toUpperCase()}]%c ${message}`,
        styles.badge,
        styles.text,
        data
      );
    }

    // Add to buffer
    this.addToBuffer(entry);

    // Send to external service in production
    if (this.isProduction) {
      this.sendToExternalService(entry);
    }
  }

  /**
   * Get console styles for different log levels
   */
  private getConsoleStyles(level: LogLevel) {
    const styles = {
      info: {
        badge: 'background: #3B82F6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
        text: 'color: #3B82F6;'
      },
      warn: {
        badge: 'background: #F59E0B; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
        text: 'color: #F59E0B;'
      },
      error: {
        badge: 'background: #EF4444; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
        text: 'color: #EF4444;'
      },
      debug: {
        badge: 'background: #6B7280; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
        text: 'color: #6B7280;'
      }
    };
    return styles[level];
  }

  /**
   * Add entry to buffer
   */
  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  /**
   * Send logs to external service
   */
  private sendToExternalService(entry: LogEntry) {
    // Implement sending to your logging service
    // Examples: Sentry, LogRocket, Datadog, CloudWatch
    
    // Example with Sentry:
    // if (window.Sentry && entry.level === 'error') {
    //   window.Sentry.captureMessage(entry.message, {
    //     level: entry.level,
    //     extra: entry.data
    //   });
    // }
  }

  /**
   * Get log buffer (for debugging)
   */
  getBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearBuffer() {
    this.logBuffer = [];
  }

  /**
   * Export logs
   */
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// Add to window for debugging
if (import.meta.env.DEV) {
  (window as any).logger = logger;
}

// Global error handler
window.addEventListener('error', (event) => {
  logger.error('Unhandled Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', {
    reason: event.reason,
    promise: event.promise
  });
});

export default logger;


