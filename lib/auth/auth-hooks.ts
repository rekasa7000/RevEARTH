"use client";

/**
 * Auth Hooks
 * Centralized authentication hooks using better-auth
 */

import { createAuthClient } from "better-auth/react";

// Create auth client with base URL
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export pre-configured hooks from better-auth
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

/**
 * Hook: Get current user data
 * Returns user object or null if not authenticated
 */
export function useUser() {
  const session = useSession();
  return session.data?.user ?? null;
}

/**
 * Hook: Check if user is authenticated
 * Simple boolean check for auth state
 */
export function useIsAuthenticated() {
  const session = useSession();
  return !!session.data?.user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string,
  callbacks?: {
    onRequest?: () => void;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
) {
  callbacks?.onRequest?.();

  const result = await signIn.email(
    { email, password },
    {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: (ctx) => {
        const error = new Error(ctx.error.message || "Sign in failed");
        callbacks?.onError?.(error);
      },
    }
  );

  return result;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string = "",
  callbacks?: {
    onRequest?: () => void;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
) {
  callbacks?.onRequest?.();

  const result = await signUp.email(
    { email, password, name },
    {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: (ctx) => {
        const error = new Error(ctx.error.message || "Sign up failed");
        callbacks?.onError?.(error);
      },
    }
  );

  return result;
}

/**
 * Sign out current user
 */
export async function signOutUser(callbacks?: {
  onRequest?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  callbacks?.onRequest?.();

  try {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          callbacks?.onSuccess?.();
          // Redirect to signin page after logout
          window.location.href = "/auth/signin";
        },
        onError: (ctx) => {
          const error = new Error(ctx.error?.message || "Sign out failed");
          callbacks?.onError?.(error);
        },
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Sign out failed");
    callbacks?.onError?.(err);
  }
}
