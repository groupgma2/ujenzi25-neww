import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, api } from '../shared/api/client';
import { isSupabaseConfigured, mapSupabaseUser, signInWithSupabase, signOutFromSupabase, signUpWithSupabase, supabase } from '../lib/supabase';
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

function formatSupabaseAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();

  if (normalized.includes('email not confirmed') || normalized.includes('not confirmed')) {
    return 'Akaunti imesajiliwa, lakini barua pepe bado haijathibitishwa. Tafadhali thibitisha barua pepe yako kwanza.';
  }

  if (normalized.includes('invalid login credentials') || normalized.includes('invalid credentials')) {
    return 'Email au password si sahihi. Tafadhali hakikisha umeingiza data sahihi.';
  }

  if (normalized.includes('signup is disabled') || normalized.includes('signups are disabled') || normalized.includes('sign up is disabled')) {
    return 'Usajili wa barua pepe umezimwa kwenye Supabase. Washa usajili ndani ya Supabase Auth settings.';
  }

  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Umejaribu kutuma barua nyingi kwa haraka. Tafadhali subiri dakika chache kisha ujaribu tena.';
  }

  if (normalized.includes('user already registered') || normalized.includes('already registered')) {
    return 'Akaunti hii tayari ipo. Tafadhali ingia badala ya kujisajili tena.';
  }

  if (normalized.includes('auth disabled') || normalized.includes('not enabled')) {
    return 'Authentication kwenye Supabase haijawezeshwa au imesitishwa. Angalia Supabase Auth settings.';
  }

  return message || 'Imeshindwa kuthibitisha akaunti. Tafadhali jaribu tena.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const initializeAuth = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user = mapSupabaseUser(session.user);
          setState({
            user,
            token: session.access_token,
            refreshToken: session.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
          localStorage.setItem('ujenzi25_user', JSON.stringify(user));
          api.setToken(session.access_token);
          localStorage.setItem('ujenzi25_refresh_token', session.refresh_token);
          await refreshUser();
          return;
        }
      } catch {
        // fall through to local auth if Supabase session not available
      }
    }

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

        await refreshUser();
      } catch {
        clearAuth();
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          if (error.message.includes('session')) {
            clearAuth();
          }
          return;
        }

        const mappedUser = mapSupabaseUser(user);
        if (mappedUser) {
          setState(prev => ({ ...prev, user: mappedUser }));
          localStorage.setItem('ujenzi25_user', JSON.stringify(mappedUser));
        }
      } catch {
        // keep session if Supabase refresh failed transiently
      }
      return;
    }

    try {
      const tokenBefore = api.getToken();
      const response = await authApi.getMe();
      if (api.getToken() !== tokenBefore) return;
      if (response.data) {
        setState(prev => ({ ...prev, user: response.data }));
        localStorage.setItem('ujenzi25_user', JSON.stringify(response.data));
      } else if (response.error && response.error.code === 'UNAUTHORIZED') {
        clearAuth();
      }
    } catch {
      // network error: keep the current session
    }
  }, [clearAuth]);

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      if (isSupabaseConfigured && supabase) {
        try {
          const data = await signInWithSupabase(email, password);
          const user = mapSupabaseUser(data.user);
          if (!user || !data.session) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw new Error('Unable to sign in with Supabase');
          }

          api.setToken(data.session.access_token);
          localStorage.setItem('ujenzi25_refresh_token', data.session.refresh_token);
          localStorage.setItem('ujenzi25_user', JSON.stringify(user));
          setState({
            user,
            token: data.session.access_token,
            refreshToken: data.session.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch (supabaseError) {
          try {
            const response = await authApi.login(email, password, rememberMe);
            if (response.error) {
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
              return;
            }
          } catch (localError) {
            setState(prev => ({ ...prev, isLoading: false }));
            const message = formatSupabaseAuthError(supabaseError) || (localError instanceof Error ? localError.message : 'Unable to sign in');
            throw new Error(message);
          }
        }
      }

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
      if (isSupabaseConfigured && supabase) {
        try {
          const signUpResult = await signUpWithSupabase({
            email: data.email,
            password: data.password,
            fullName: data.fullName,
            phone: data.phone,
            role: data.role,
          });

          const finalSession = signUpResult.session;
          const finalUser = signUpResult.user;

          if (!finalUser) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw new Error('Unable to complete registration');
          }

          const user = mapSupabaseUser(finalUser);
          if (!user) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw new Error('Registration succeeded but your account could not be loaded. Please try again.');
          }

          if (!finalSession) {
            const fallback = await signInWithSupabase(data.email, data.password);
            if (!fallback.session || !fallback.user) {
              setState(prev => ({ ...prev, isLoading: false }));
              throw new Error('Akaunti imeundwa. Tafadhali thibitisha barua pepe yako kabla ya kuingia. Ikiwa unataka kuingia mara moja katika mazingira ya maendeleo, zima “Confirm email” kwenye Supabase Auth settings.');
            }
            api.setToken(fallback.session.access_token);
            localStorage.setItem('ujenzi25_refresh_token', fallback.session.refresh_token);
            localStorage.setItem('ujenzi25_user', JSON.stringify(user));
            setState({
              user,
              token: fallback.session.access_token,
              refreshToken: fallback.session.refresh_token,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }

          api.setToken(finalSession.access_token);
          localStorage.setItem('ujenzi25_refresh_token', finalSession.refresh_token);
          localStorage.setItem('ujenzi25_user', JSON.stringify(user));
          setState({
            user,
            token: finalSession.access_token,
            refreshToken: finalSession.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch (supabaseError) {
          try {
            const response = await authApi.register(data);
            if (response.error) {
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
              return;
            }
          } catch (localError) {
            setState(prev => ({ ...prev, isLoading: false }));
            const message = formatSupabaseAuthError(supabaseError) || (localError instanceof Error ? localError.message : 'Registration failed');
            throw new Error(message);
          }
        }
      }

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
      if (isSupabaseConfigured && supabase) {
        await signOutFromSupabase();
      } else {
        await authApi.logout();
      }
    } catch {
      // ignore logout errors and still clear local session state
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: updatedUser, error } = await supabase.auth.updateUser({
          data: {
            full_name: data.fullName,
            phone: data.phone,
            role: data.role,
          },
        });
        if (error) throw error;
        const mappedUser = mapSupabaseUser(updatedUser.user);
        if (!mappedUser) throw new Error('Profile update failed');
        setState(prev => ({ ...prev, user: mappedUser }));
        localStorage.setItem('ujenzi25_user', JSON.stringify(mappedUser));
        return;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Profile update failed');
      }
    }

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