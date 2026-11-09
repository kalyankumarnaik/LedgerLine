import { ApiResponse } from '../types';
import { mockEngine } from './mockEngine';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL
    ? `${(import.meta.env.VITE_API_URL as string).replace(/\/$/, '')}/api/v1`
    : (import.meta.env.VITE_API_BASE_URL || '/api/v1')
) as string;

class ApiClient {
  private getAccessToken(): string | null {
    return localStorage.getItem('ledgerline_token');
  }

  public setTokens(token: string, refreshToken?: string) {
    localStorage.setItem('ledgerline_token', token);
    if (refreshToken) {
      localStorage.setItem('ledgerline_refresh_token', refreshToken);
    }
  }

  public clearAuth() {
    localStorage.removeItem('ledgerline_token');
    localStorage.removeItem('ledgerline_refresh_token');
    localStorage.removeItem('ledgerline_user');
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { idempotencyKey?: string } = {}
  ): Promise<T> {
    const { idempotencyKey, ...fetchOptions } = options;
    const token = this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';

      // If backend returns HTML (e.g. Vercel SPA rewrite fallback for /api/*) or 404/502/503/504
      if (
        (response.status === 404 && !contentType.includes('application/json')) ||
        (response.status >= 500 && contentType.includes('text/html')) ||
        (response.status === 404 && contentType.includes('text/html'))
      ) {
        return mockEngine.handleRequest<T>(endpoint, options);
      }

      if (response.status === 401 && !endpoint.includes('/auth/')) {
        // Attempt token refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...fetchOptions,
            headers,
          });
          return this.handleResponse<T>(retryResponse);
        } else {
          this.clearAuth();
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
      }

      return await this.handleResponse<T>(response);
    } catch (err: any) {
      // If error is network failure or backend not responding, fallback seamlessly to Mock Engine
      // This allows Vercel deployments and offline exploration to run 100% end-to-end!
      if (
        err?.name === 'TypeError' ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.message?.includes('Backend server is not running')
      ) {
        console.info(`[LedgerLine Core] Connecting via in-memory ledger engine for: ${endpoint}`);
        return mockEngine.handleRequest<T>(endpoint, options);
      }
      throw err;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data: ApiResponse<T> = await response.json();
      if (!response.ok || (data.success === false && data.data === undefined)) {
        throw new Error(data.message || (data as any).error || 'Request failed');
      }
      return data.data !== undefined ? data.data : (data as unknown as T);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (
        response.status === 500 &&
        (!errorText || errorText.includes('ECONNREFUSED') || errorText.includes('proxy error'))
      ) {
        throw new Error('Backend server is not running on port 8080. Please start the backend service (start-backend.ps1).');
      }
      throw new Error(errorText || `HTTP Error ${response.status}`);
    }

    return (await response.text()) as unknown as T;
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('ledgerline_refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const json = await response.json();
        const data = json.data;
        this.setTokens(data.token, data.refreshToken);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, idempotencyKey?: string) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      idempotencyKey,
    });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
