// src/context/AuthContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ApiError, authApi, getToken, removeToken } from "../services/api";

// ========================================
// TYPES
// ========================================

export type UserRole = "SYSTEM_ADMIN" | "ASO" | "TSO" | "TSM" | "TECHNICIAN";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserPermissions {
  [key: string]: any;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  role: UserRole;
  status: UserStatus;
  permissions: UserPermissions;
}

interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

interface AuthContextType {
  // ----------------------------------------
  // STATE
  // ----------------------------------------

  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // ----------------------------------------
  // AUTH ACTIONS
  // ----------------------------------------

  login: (email: string, password: string) => Promise<LoginResponse>;

  logout: () => Promise<void>;

  refreshProfile: () => Promise<AuthUser | null>;

  // ----------------------------------------
  // PERMISSION HELPERS
  // ----------------------------------------

  hasRole: (role: UserRole | UserRole[]) => boolean;

  hasPermission: (group: string, permission?: string) => boolean;
}

// ========================================
// CONTEXT
// ========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================
// PROVIDER
// ========================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ----------------------------------------
  // STATE
  // ----------------------------------------

  const [user, setUser] = useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // ========================================
  // LOAD EXISTING SESSION
  // ========================================

  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check whether a JWT exists.
      const token = await getToken();

      if (!token) {
        setUser(null);
        return;
      }

      // Token exists.
      // Verify it against the backend.
      const response = await authApi.getProfile();

      if (response?.user) {
        setUser(response.user);
      } else {
        // Unexpected profile response.
        await removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error("Session Restore Error:", error);

      /*
       * If the token is invalid/expired,
       * remove it and require login again.
       */

      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        await removeToken();
      }

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================
  // INITIAL SESSION CHECK
  // ========================================

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ========================================
  // LOGIN
  // ========================================

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResponse> => {
      const response = await authApi.login(
        email.trim().toLowerCase(),
        password,
      );

      /*
       * authApi.login() already stores the JWT
       * securely using Expo SecureStore.
       */

      if (!response?.user) {
        throw new ApiError("User information was not received from server");
      }

      // Make sure the authenticated user is active.
      if (response.user.status !== "ACTIVE") {
        await removeToken();

        throw new ApiError("Your account is inactive", 403, response);
      }

      setUser(response.user);

      return response;
    },
    [],
  );

  // ========================================
  // LOGOUT
  // ========================================

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      // Always clear local authentication state.
      await removeToken();

      setUser(null);
    }
  }, []);

  // ========================================
  // REFRESH PROFILE
  // ========================================

  const refreshProfile = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const token = await getToken();

      if (!token) {
        setUser(null);
        return null;
      }

      const response = await authApi.getProfile();

      if (!response?.user) {
        return null;
      }

      setUser(response.user);

      return response.user;
    } catch (error) {
      console.error("Refresh Profile Error:", error);

      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        await logout();
      }

      return null;
    }
  }, [logout]);

  // ========================================
  // HAS ROLE
  // ========================================

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) {
        return false;
      }

      if (Array.isArray(role)) {
        return role.includes(user.role);
      }

      return user.role === role;
    },
    [user],
  );

  // ========================================
  // HAS PERMISSION
  // ========================================

  const hasPermission = useCallback(
    (group: string, permission?: string): boolean => {
      if (!user) {
        return false;
      }

      /*
       * SYSTEM_ADMIN has full access.
       */

      if (user.role === "SYSTEM_ADMIN") {
        return true;
      }

      const permissions = user.permissions || {};

      // ----------------------------------------
      // GROUP CHECK
      // ----------------------------------------

      if (!permission) {
        return permissions[group] === true;
      }

      // ----------------------------------------
      // NESTED PERMISSION CHECK
      // ----------------------------------------

      const groupPermissions = permissions[group];

      if (!groupPermissions) {
        return false;
      }

      if (typeof groupPermissions === "boolean") {
        return groupPermissions;
      }

      return groupPermissions[permission] === true;
    },
    [user],
  );

  // ========================================
  // MEMOIZED CONTEXT VALUE
  // ========================================

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,

      login,
      logout,
      refreshProfile,

      hasRole,
      hasPermission,
    }),
    [user, isLoading, login, logout, refreshProfile, hasRole, hasPermission],
  );

  // ========================================
  // PROVIDER
  // ========================================

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// ========================================
// USE AUTH HOOK
// ========================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
