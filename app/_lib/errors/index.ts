export class AppError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class ApiError extends AppError {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string, public retryAfter: number = 10) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class CameraError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'CameraError';
  }
}
