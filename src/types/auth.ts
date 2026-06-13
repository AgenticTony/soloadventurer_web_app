export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  location?: string
  emailVerified: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: AuthError | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<{ userConfirmed: boolean }>
  logout: () => Promise<void>
  clearAuthState: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>
  confirmSignUp: (email: string, code: string) => Promise<void>
  resendSignUpCode: (email: string) => Promise<void>
}

export interface AuthError {
  code: string
  message: string
  name: string
}

export interface SignUpResult {
  userConfirmed: boolean
  userSub?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: AuthError | null
}

// Supabase auth error codes
export const SUPABASE_ERROR_CODES = {
  USER_NOT_FOUND: 'user_not_found',
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  USER_ALREADY_REGISTERED: 'user_already_registered',
  WEAK_PASSWORD: 'weak_password',
  OTP_EXPIRED: 'otp_expired',
  INVALID_OTP: 'invalid_otp',
  TOO_MANY_REQUESTS: 'too_many_requests',
  SESSION_EXPIRED: 'session_not_found',
} as const

export type SupabaseErrorCode = keyof typeof SUPABASE_ERROR_CODES
