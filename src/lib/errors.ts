// ============================================================
// src/lib/errors.ts
// Standardized application errors & safe API response envelope
// Per SECURITY.md §10 and ARCHITECTURE.md §4
// ============================================================

export type AppErrorCode =
  | 'INVALID_INPUT'
  | 'RATE_LIMITED'
  | 'UPSTREAM_UNAVAILABLE'
  | 'AI_UNAVAILABLE'
  | 'FORBIDDEN_ORIGIN'
  | 'PAYLOAD_TOO_LARGE'
  | 'INTERNAL';

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly statusCode: number;
  public readonly safeMessage: string;

  constructor(code: AppErrorCode, message: string, statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.safeMessage = message;

    if (statusCode) {
      this.statusCode = statusCode;
    } else {
      switch (code) {
        case 'INVALID_INPUT':
          this.statusCode = 400;
          break;
        case 'FORBIDDEN_ORIGIN':
          this.statusCode = 403;
          break;
        case 'PAYLOAD_TOO_LARGE':
          this.statusCode = 413;
          break;
        case 'RATE_LIMITED':
          this.statusCode = 429;
          break;
        case 'UPSTREAM_UNAVAILABLE':
        case 'AI_UNAVAILABLE':
          this.statusCode = 503;
          break;
        case 'INTERNAL':
        default:
          this.statusCode = 500;
          break;
      }
    }
  }
}

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: AppErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function createSuccessResponse<T>(data: T, status = 200): Response {
  const payload: ApiSuccessResponse<T> = { ok: true, data };
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function createErrorResponse(
  error: unknown,
  fallbackMessage = 'An unexpected internal error occurred.'
): Response {
  if (error instanceof AppError) {
    const payload: ApiErrorResponse = {
      ok: false,
      error: { code: error.code, message: error.safeMessage },
    };
    return new Response(JSON.stringify(payload), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload: ApiErrorResponse = {
    ok: false,
    error: { code: 'INTERNAL', message: fallbackMessage },
  };
  return new Response(JSON.stringify(payload), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
