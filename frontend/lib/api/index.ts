// API Configuration and Base Setup
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API || "http://localhost:5002/api",
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Error Types
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
}

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Request Configuration
export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  params?: Record<string, any>;
}

// Token Management
export class TokenManager {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  static getTokenExpiration(): number | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }
}

// --- Modular API Route Definitions ---

const BASE_URL = API_CONFIG.BASE_URL;

const bases = {
  users: "users",
  auth: "auth",
  events: "events",
  teams: "teams",
  content: "content",
  media: "media",
  contact: "contact",
  payment: "payment",
  analytics: "analytics",
};

const auth = {
  base: `${BASE_URL}/${bases.auth}`,
  login: `${BASE_URL}/${bases.auth}/login`,
  register: `${BASE_URL}/${bases.auth}/register`,
  registerAdmin: `${BASE_URL}/${bases.auth}/register/admin`,
  refreshToken: `${BASE_URL}/${bases.auth}/refresh-token`,
  logout: `${BASE_URL}/${bases.auth}/logout`,
  verifyEmail: `${BASE_URL}/${bases.auth}/verify-email`,
  resendVerification: `${BASE_URL}/${bases.auth}/resend-verification`,
};

const users = {
  base: `${BASE_URL}/${bases.users}`,
  profile: `${BASE_URL}/${bases.users}/profile`,
  updateProfile: `${BASE_URL}/${bases.users}/profile`,
  changePassword: `${BASE_URL}/${bases.users}/change-password`,
  list: `${BASE_URL}/${bases.users}`,
  byId: (id: string) => `${BASE_URL}/${bases.users}/${id}`,
  update: (id: string) => `${BASE_URL}/${bases.users}/${id}`,
  delete: (id: string) => `${BASE_URL}/${bases.users}/${id}`,
  deactivate: (id: string) => `${BASE_URL}/${bases.users}/${id}/deactivate`,
};

const events = {
  base: `${BASE_URL}/${bases.events}`,
  list: `${BASE_URL}/${bases.events}`,
  create: `${BASE_URL}/${bases.events}`,
  byId: (id: string) => `${BASE_URL}/${bases.events}/${id}`,
  update: (id: string) => `${BASE_URL}/${bases.events}/${id}`,
  delete: (id: string) => `${BASE_URL}/${bases.events}/${id}`,
  register: (id: string) => `${BASE_URL}/${bases.events}/${id}/register`,
};

const teams = {
  base: `${BASE_URL}/${bases.teams}`,
  list: `${BASE_URL}/${bases.teams}`,
  create: `${BASE_URL}/${bases.teams}`,
  byId: (id: string) => `${BASE_URL}/${bases.teams}/${id}`,
  update: (id: string) => `${BASE_URL}/${bases.teams}/${id}`,
  delete: (id: string) => `${BASE_URL}/${bases.teams}/${id}`,
  join: (id: string) => `${BASE_URL}/${bases.teams}/${id}/join`,
  leave: (id: string) => `${BASE_URL}/${bases.teams}/${id}/leave`,
};

const content = {
  base: `${BASE_URL}/${bases.content}`,
  list: `${BASE_URL}/${bases.content}`,
  create: `${BASE_URL}/${bases.content}`,
  byId: (id: string) => `${BASE_URL}/${bases.content}/${id}`,
  update: (id: string) => `${BASE_URL}/${bases.content}/${id}`,
  delete: (id: string) => `${BASE_URL}/${bases.content}/${id}`,
};

const media = {
  upload: `${BASE_URL}/${bases.media}/upload`,
  list: `${BASE_URL}/${bases.media}`,
  byId: (id: string) => `${BASE_URL}/${bases.media}/${id}`,
  delete: (id: string) => `${BASE_URL}/${bases.media}/${id}`,
};

const contact = {
  submit: `${BASE_URL}/${bases.contact}`,
  list: `${BASE_URL}/${bases.contact}`,
  byId: (id: string) => `${BASE_URL}/${bases.contact}/${id}`,
  respond: (id: string) => `${BASE_URL}/${bases.contact}/${id}/respond`,
};

const payment = {
  donate: `${BASE_URL}/${bases.payment}/donate`,
  webhook: `${BASE_URL}/${bases.payment}/webhook`,
  history: `${BASE_URL}/${bases.payment}/history`,
};

const analytics = {
  dashboard: `${BASE_URL}/${bases.analytics}/dashboard`,
  events: `${BASE_URL}/${bases.analytics}/events`,
  users: `${BASE_URL}/${bases.analytics}/users`,
};

export const apiRoutes = {
  auth,
  users,
  events,
  teams,
  content,
  media,
  contact,
  payment,
  analytics,
};
