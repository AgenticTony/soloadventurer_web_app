// Core auth user interface (Supabase-compatible)
export interface AuthUser {
  userId: string;
  email: string;
  emailVerified: boolean;
}

// Extended user profile interface
export interface UserProfile extends AuthUser {
  name: string;
  bio: string;
  avatarUrl: string | null;
  location: string;
  createdAt: string;
  updatedAt: string;
}

// Sign up result
export interface SignUpResult {
  userConfirmed: boolean;
  userId?: string;
}

// Sign in result
export interface SignInResult {
  isSignedIn: boolean;
}

// Auth session interface
export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  isValid: boolean;
}

// Auth state for context/store
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  error: string | null;
}

// Form validation types
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface ConfirmResetPasswordFormData {
  email: string;
  confirmationCode: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ConfirmSignUpFormData {
  email: string;
  confirmationCode: string;
}
