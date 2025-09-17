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

// AWS Cognito specific error codes
export const COGNITO_ERROR_CODES = {
  USER_NOT_CONFIRMED: 'UserNotConfirmedException',
  USER_ALREADY_AUTHENTICATED: 'UserAlreadyAuthenticatedException',
  USERNAME_EXISTS: 'UsernameExistsException',
  USER_NOT_FOUND: 'UserNotFoundException',
  INVALID_PASSWORD: 'InvalidPasswordException',
  CODE_MISMATCH: 'CodeMismatchException',
  EXPIRED_CODE: 'ExpiredCodeException',
  LIMIT_EXCEEDED: 'LimitExceededException',
  TOO_MANY_REQUESTS: 'TooManyRequestsException',
} as const

export type CognitoErrorCode = keyof typeof COGNITO_ERROR_CODES