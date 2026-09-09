import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, api } from '../shared/api/client';
import type { User, UserRole, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('ujenzi25_auth_token');
    const refreshToken = localStorage.getItem('ujenzi25_refresh_token');
    const userStr = localStorage.getItem('ujenzi25_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // Verify token is still valid
        await refreshUser();
      } catch {
        clearAuth();
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('ujenzi25_auth_token');
    localStorage.removeItem('ujenzi25_refresh_token');
    localStorage.removeItem('ujenzi25_user');
    api.setToken(null);
    setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const tokenBefore = api.getToken();
      const response = await authApi.getMe();
      // A new session (login) may have started while this request was in flight —
      // ignore stale results so they can never log out the fresh session.
      if (api.getToken() !== tokenBefore) return;
      if (response.data) {
        setState(prev => ({ ...prev, user: response.data }));
        localStorage.setItem('ujenzi25_user', JSON.stringify(response.data));
      } else if (response.error && response.error.code === 'UNAUTHORIZED') {
        clearAuth();
      }
      // network / transient errors: keep the current session
    } catch {
      // network error: keep the current session
    }
  }, [clearAuth]);

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authApi.login(email, password, rememberMe);

      if (response.error) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error(response.error.message);
      }

      if (response.data) {
        const { user, token, refreshToken } = response.data;
        api.setToken(token);
        localStorage.setItem('ujenzi25_refresh_token', refreshToken);
        localStorage.setItem('ujenzi25_user', JSON.stringify(user));

        setState({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: any) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await authApi.register(data);

      if (response.error) {
        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error(response.error.message);
      }

      if (response.data) {
        const { user, token, refreshToken } = response.data;
        api.setToken(token);
        localStorage.setItem('ujenzi25_refresh_token', refreshToken);
        localStorage.setItem('ujenzi25_user', JSON.stringify(user));

        setState({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const response = await authApi.updateProfile(data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    if (response.data) {
      setState(prev => ({ ...prev, user: { ...prev.user!, ...response.data } }));
      localStorage.setItem('ujenzi25_user', JSON.stringify({ ...state.user!, ...response.data }));
    }
  }, [state.user]);

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.user.role);
  }, [state.user]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser, updateProfile, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}