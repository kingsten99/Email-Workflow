export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}