// Export service instance and class
export { authService, AuthService } from './authService';

// Export all types
export type {
  AuthUser,
  UserProfile,
  SignUpResult,
  SignInResult,
  AuthSession,
  AuthState,
  AuthAction,
  SignUpFormData,
  SignInFormData,
  ResetPasswordFormData,
  ConfirmResetPasswordFormData,
  ConfirmSignUpFormData,
  SignUpInput,
  SignInInput,
  ConfirmSignUpInput,
  ResetPasswordInput,
  ConfirmResetPasswordInput,
} from './types';

// Export API error for consumers
export { ApiError } from '../base/ApiClient';