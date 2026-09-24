import axios, { AxiosError } from 'axios';

export interface ApiErrorResponse {
  status?: boolean;
  message?: string;
  error?: string;
  code?: string;
  errors?: Record<string, string[] | string>;
}

/**
 * Custom Error class representing a standardized API failure.
 * Normalizes HTTP status codes, server error messages, and validation errors.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly validationErrors?: Record<string, string[] | string>;
  public readonly rawError: unknown;
  public readonly isNetworkError: boolean;

  constructor({
    message,
    status = 500,
    code,
    validationErrors,
    rawError,
    isNetworkError = false,
  }: {
    message: string;
    status?: number;
    code?: string;
    validationErrors?: Record<string, string[] | string>;
    rawError?: unknown;
    isNetworkError?: boolean;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.validationErrors = validationErrors;
    this.rawError = rawError;
    this.isNetworkError = isNetworkError;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Helper to determine if error was caused by unauthenticated request (401)
   */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Helper to determine if error was forbidden (403)
   */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Helper to determine if error was not found (404)
   */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Helper to determine if error is a validation error (400 or 422)
   */
  get isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

/**
 * Extracts and normalizes errors thrown by Axios or network calls into an ApiError
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;

    // Network timeout or no connection
    if (axiosErr.code === 'ECONNABORTED' || axiosErr.message.includes('timeout')) {
      return new ApiError({
        message: 'Request timed out. Please check your internet connection.',
        status: 408,
        code: 'TIMEOUT',
        rawError: error,
        isNetworkError: true,
      });
    }

    if (!axiosErr.response) {
      return new ApiError({
        message: 'Unable to connect to the server. Please check your internet connection.',
        status: 0,
        code: 'NETWORK_ERROR',
        rawError: error,
        isNetworkError: true,
      });
    }

    const responseData = axiosErr.response.data;
    const status = axiosErr.response.status;

    // Extract message prioritizing backend response
    const message =
      responseData?.message ||
      responseData?.error ||
      (typeof responseData === 'string' ? responseData : null) ||
      axiosErr.message ||
      'An unexpected error occurred';

    return new ApiError({
      message,
      status,
      code: responseData?.code,
      validationErrors: responseData?.errors,
      rawError: error,
      isNetworkError: false,
    });
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      status: 500,
      rawError: error,
    });
  }

  return new ApiError({
    message: 'An unexpected error occurred. Please try again.',
    status: 500,
    rawError: error,
  });
}
