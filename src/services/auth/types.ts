// Re-export Amplify types for consistency
export type {
  SignUpInput,
  SignInInput,
  ConfirmSignUpInput,
  ResetPasswordInput,
  ConfirmResetPasswordInput,
} from 'aws-amplify/auth';

// Core auth user interface
export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  emailVerified: boolean;
}

// Extended user profile interface
export interface UserProfile extends AuthUser {
  name: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Sign up result
export interface SignUpResult {
  isSignUpComplete: boolean;
  nextStep: {
    signUpStep: string;
    additionalInfo?: Record<string, unknown>;
  };
  userId?: string;
}

// Sign in result
export interface SignInResult {
  isSignedIn: boolean;
  nextStep: {
    signInStep: string;
    additionalInfo?: Record<string, unknown>;
  };
}

// Auth session interface
export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
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

// Auth context actions
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_SESSION'; payload: AuthSession | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SIGN_OUT' };

// Form validation types
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
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