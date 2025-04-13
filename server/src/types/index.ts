export interface ErrorResponse {
  message: string;
  stack?: string;
  errors?: Record<string, string[]>;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};
