// User type matches backend schema
export interface UserType {
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    yearOfStudy?: number;
    phone?: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
    avatar?: string; 
  }
  
  export interface AuthState {
    user: UserType | null;
    token: string | null;
    isAuthenticated: boolean;
    isRegistered: boolean;
    loading: boolean;
    error: string | null;
  }

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  department: string;
  yearOfStudy: string;
  phone: string;
}
export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ResendVerificationPayload {
  email: string;
}
