import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  fetchAuthSession,
  getCurrentUser,
  type SignUpInput,
  type SignInInput,
  type ConfirmSignUpInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
} from 'aws-amplify/auth';
import { ApiError } from '../base/ApiClient';
import type {
  AuthUser,
  SignUpResult,
  SignInResult,
  AuthSession,
  UserProfile
} from './types';

export class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(credentials: SignUpInput): Promise<SignUpResult> {
    try {
      const result = await signUp(credentials);

      return {
        isSignUpComplete: result.isSignUpComplete,
        nextStep: result.nextStep,
        userId: result.userId,
      };
    } catch (error: unknown) {
      const err = error as Error & { statusCode?: number; details?: { field: string; message: string; }[] };
      throw new ApiError(
        err.message || 'Sign up failed',
        err.statusCode,
        err.details
      );
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInInput): Promise<SignInResult> {
    try {
      const result = await signIn(credentials);

      return {
        isSignedIn: result.isSignedIn,
        nextStep: result.nextStep,
      };
    } catch (error: unknown) {
      const err = error as Error & { statusCode?: number; details?: { field: string; message: string; }[] };
      throw new ApiError(
        err.message || 'Sign in failed',
        err.statusCode,
        err.details
      );
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut();
    } catch (error: unknown) {
      const err = error as Error & { statusCode?: number };
      throw new ApiError(
        err.message || 'Sign out failed',
        err.statusCode
      );
    }
  }

  /**
   * Confirm user sign up with verification code
   */
  async confirmSignUp(input: ConfirmSignUpInput): Promise<void> {
    try {
      await confirmSignUp(input);
    } catch (error: unknown) {
      const err = error as Error & { statusCode?: number; details?: { field: string; message: string; }[] };
      throw new ApiError(
        err.message || 'Email confirmation failed',
        err.statusCode,
        err.details
      );
    }
  }

  /**
   * Request password reset
   */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    try {
      await resetPassword(input);
    } catch (error: unknown) {
      const err = error as Error & { statusCode?: number };
      throw new ApiError(
        err.message || 'Password reset request failed',
        err.statusCode
      );
    }
  }

  /**
   * Confirm password reset with verification code
   */
  async confirmResetPassword(input: ConfirmResetPasswordInput): Promise<void> {
    try {
      await confirmResetPassword(input);
    } catch (error: unknown) {
      const err = error as Error & { statusCode?: number };
      throw new ApiError(
        err.message || 'Password reset confirmation failed',
        err.statusCode
      );
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await getCurrentUser();

      return {
        userId: user.userId,
        username: user.username,
        email: user.signInDetails?.loginId || '',
        emailVerified: true, // Assume verified if user is authenticated
      };
    } catch (error: unknown) {
      // User not authenticated
      const err = error as Error & { statusCode?: number };
      if (err.name === 'UserUnauthorizedException' ||
          err.name === 'NotAuthorizedException') {
        return null;
      }

      throw new ApiError(
        err.message || 'Failed to get current user',
        err.statusCode
      );
    }
  }

  /**
   * Get current auth session with tokens
   */
  async getAuthSession(): Promise<AuthSession | null> {
    try {
      const session = await fetchAuthSession();

      if (!session.tokens) {
        return null;
      }

      return {
        accessToken: session.tokens.accessToken.toString(),
        idToken: session.tokens.idToken?.toString() || '',
        refreshToken: session.tokens.accessToken.toString(), // Use accessToken as refreshToken fallback
        isValid: true,
      };
    } catch (error: unknown) {
      // Session not available
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getAuthSession();
      return session?.isValid || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user profile information
   * This combines auth user data with profile data
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const user = await this.getCurrentUser();

      if (!user) {
        return null;
      }

      // In the future, this could fetch additional profile data from GraphQL/REST API
      return {
        ...user,
        name: user.username, // Default to username
        bio: '',
        avatarUrl: null,
        createdAt: new Date().toISOString(), // Placeholder
        updatedAt: new Date().toISOString(), // Placeholder
      };
    } catch (error: unknown) {
      const err = error as Error & { statusCode?: number };
      throw new ApiError(
        err.message || 'Failed to get user profile',
        err.statusCode
      );
    }
  }

  /**
   * Refresh authentication session
   */
  async refreshSession(): Promise<AuthSession | null> {
    try {
      // Amplify handles token refresh automatically
      return await this.getAuthSession();
    } catch (error: unknown) {
      const err = error as Error & { statusCode?: number };
      throw new ApiError(
        err.message || 'Failed to refresh session',
        err.statusCode
      );
    }
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export the service class for testing
export default AuthService;