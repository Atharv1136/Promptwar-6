// ============================================================
// src/lib/logger.ts
// Redacting logger ensuring zero PII or credentials are leaked
// Per SECURITY.md §8 and AGENT.md §4
// ============================================================

const REDACTED_KEYS = new Set([
  'lat',
  'lon',
  'latitude',
  'longitude',
  'note',
  'question',
  'profile',
  'gemini_api_key',
  'apikey',
  'key',
]);

export function redactSensitiveData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (REDACTED_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  event: string;
  timestamp: string;
  meta?: unknown;
}

export const logger = {
  info(event: string, meta?: unknown): LogEntry {
    return {
      level: 'info',
      event,
      timestamp: new Date().toISOString(),
      ...(meta ? { meta: redactSensitiveData(meta) } : {}),
    };
  },

  warn(event: string, meta?: unknown): LogEntry {
    return {
      level: 'warn',
      event,
      timestamp: new Date().toISOString(),
      ...(meta ? { meta: redactSensitiveData(meta) } : {}),
    };
  },

  error(event: string, meta?: unknown): LogEntry {
    return {
      level: 'error',
      event,
      timestamp: new Date().toISOString(),
      ...(meta ? { meta: redactSensitiveData(meta) } : {}),
    };
  },
};
