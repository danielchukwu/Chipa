/**
 * Standard API Response envelope matching Chipa Go backend RespondSuccess
 */
export interface ApiResponse<T = any> {
  status: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Standard Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

/**
 * Common Currency code union
 */
export type SupportedCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR';
