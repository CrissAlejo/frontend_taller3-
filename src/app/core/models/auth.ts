export interface LoginCredentials { email: string; password: string; }
export interface AuthUser { email: string; rol: string; }
export interface AuthSession { token: string; user: AuthUser; }
export interface AuthResponse {
  success: boolean;
  data?: AuthSession | null;
  message?: string;
  error?: { message: string; code?: string };
  errors?: { path: string; message: string }[];
}
