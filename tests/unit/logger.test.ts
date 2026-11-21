import { describe, it, expect } from 'vitest';
import { logger, redactSensitiveData } from '@/lib/logger';

describe('Logger & Redaction Suite', () => {
  it('handles primitive, null, and undefined values cleanly', () => {
    expect(redactSensitiveData(null)).toBeNull();
    expect(redactSensitiveData(undefined)).toBeUndefined();
    expect(redactSensitiveData(42)).toBe(42);
    expect(redactSensitiveData('hello')).toBe('hello');
  });

  it('redacts sensitive location coordinates (lat, lon, latitude, longitude)', () => {
    const payload = {
      user: 'test-user',
      lat: 18.5204,
      lon: 73.8567,
      latitude: 28.6139,
      longitude: 77.209,
      city: 'Delhi',
    };

    const redacted = redactSensitiveData(payload) as Record<string, unknown>;
    expect(redacted.city).toBe('Delhi');
    expect(redacted.lat).toBe('[REDACTED]');
    expect(redacted.lon).toBe('[REDACTED]');
    expect(redacted.latitude).toBe('[REDACTED]');
    expect(redacted.longitude).toBe('[REDACTED]');
  });

  it('redacts user free-text notes, questions, and API keys', () => {
    const payload = {
      note: 'My daughter has severe asthma and uses an inhaler',
      question: 'Can we go outside tomorrow?',
      apiKey: 'AIzaSyExampleSecretKey12345',
      gemini_api_key: 'AIzaSyExampleSecretKey67890',
      action: 'generate_plan',
    };

    const redacted = redactSensitiveData(payload) as Record<string, unknown>;
    expect(redacted.action).toBe('generate_plan');
    expect(redacted.note).toBe('[REDACTED]');
    expect(redacted.question).toBe('[REDACTED]');
    expect(redacted.apiKey).toBe('[REDACTED]');
    expect(redacted.gemini_api_key).toBe('[REDACTED]');
  });

  it('recursively redacts nested objects and arrays', () => {
    const complex = {
      event: 'request_received',
      payload: {
        profile: {
          note: 'Sensitive information',
        },
        items: [{ lat: 12.34 }, { clean: 'data' }],
      },
    };

    const redacted = redactSensitiveData(complex) as {
      event: string;
      payload: { profile: string; items: [{ lat: string }, { clean: string }] };
    };
    expect(redacted.payload.profile).toBe('[REDACTED]');
    expect(redacted.payload.items[0].lat).toBe('[REDACTED]');
    expect(redacted.payload.items[1].clean).toBe('data');
  });

  it('emits structured log entries for info, warn, and error', () => {
    const infoLog = logger.info('plan_generated', { durationMs: 120, lat: 18.52 });
    expect(infoLog.level).toBe('info');
    expect(infoLog.event).toBe('plan_generated');
    expect((infoLog.meta as { durationMs: number; lat: string }).durationMs).toBe(120);
    expect((infoLog.meta as { durationMs: number; lat: string }).lat).toBe('[REDACTED]');

    const warnLog = logger.warn('quota_warning', { remaining: 5 });
    expect(warnLog.level).toBe('warn');
    expect(warnLog.event).toBe('quota_warning');

    const errLog = logger.error('upstream_timeout', { error: '504 Gateway Timeout' });
    expect(errLog.level).toBe('error');
    expect(errLog.event).toBe('upstream_timeout');
  });
});
