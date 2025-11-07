import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { UserRole, User, Organization, SubscriptionPlan, PendingLoginData } from '../types';
import * as api from "../services/backendApiService";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  organization: Organization | null;
  subscription: SubscriptionPlan | null;
  role: UserRole | null;
  login: (username: string, password?: string) => Promise<User | null>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  mfaRequired: boolean;
  mustChangePassword: boolean;
  loginWithGoogle: () => Promise<boolean>;
  verifyMfa: (code: string) => Promise<boolean>;
  cancelMfa: () => void;
  completePendingLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);
  const [mfaUser, setMfaUser] = useState<User | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);
  const [pendingLoginData, setPendingLoginData] = useState<PendingLoginData | null>(null);

  const completeLogin = useCallback((loggedInUser: User, loggedInOrg: Organization, loggedInSub: SubscriptionPlan, token?: string) => {
    const { password: _, ...userToStore } = loggedInUser;
    setUser(userToStore);
    setOrganization(loggedInOrg);
    setSubscription(loggedInSub);
    setIsAuthenticated(true);
    setMfaRequired(false);
    setMfaUser(null);
    
    // Store the token if provided
    if (token) {
      localStorage.setItem('authToken', token);
    }
  }, []);

  const completePendingLogin = useCallback(() => {
    if (pendingLoginData) {
      const { token, user: loggedInUser, organization: loggedInOrg, subscription: loggedInSub } = pendingLoginData;
      completeLogin(loggedInUser, loggedInOrg, loggedInSub, token);
      setMustChangePassword(false);
      setPendingLoginData(null);
    }
  }, [pendingLoginData, completeLogin]);

  const logout = useCallback(() => {
    setUser(null);
    setOrganization(null);
    setSubscription(null);
    setIsAuthenticated(false);
    setMfaRequired(false);
    setMfaUser(null);
    setMustChangePassword(false);
    setPendingLoginData(null);
    localStorage.removeItem('authToken');
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const { user: currentUser, organization: currentOrg, subscription: currentSub } = await api.fetchCurrentUser();
        completeLogin(currentUser, currentOrg, currentSub);
      } catch (error) {
        console.error("Auth check failed, token might be invalid.", error);
        logout();
      }
    } else {
        setIsAuthenticated(false);
        setUser(null);
        setOrganization(null);
        setSubscription(null);
    }
    setIsLoading(false);
  }, [completeLogin, logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  

  const login = async (username: string, password?: string): Promise<User | null> => {
    try {
      const response = await api.login(username, password);
      const { token, user: loggedInUser, organization: loggedInOrg, subscription: loggedInSub, mustChangePassword: needsPasswordChange } = response;
      
      if (needsPasswordChange) {
        setMustChangePassword(true);
        setPendingLoginData({ token, user: loggedInUser, organization: loggedInOrg, subscription: loggedInSub });
        localStorage.setItem('authToken', token); // Store token for password change API call
        return loggedInUser;
      } else if (loggedInUser.mfaEnabled) {
        setMfaUser(loggedInUser);
        setMfaRequired(true);
        return loggedInUser;
      } else {
        completeLogin(loggedInUser, loggedInOrg, loggedInSub, token);
        return loggedInUser;
      }
    } catch (error) {
      console.error("Login failed:", error);
      logout();
      return null;
    }
  };

  // Mocked flows for Google
  const loginWithGoogle = async (): Promise<boolean> => {
    console.warn("loginWithGoogle is not implemented with a real backend yet.");
    return false;
  };

  const verifyMfa = async (code: string): Promise<boolean> => {
    console.warn("verifyMfa is not implemented with a real backend yet.");
    if (mfaUser && code === '123456') {
        // After successful MFA, we must fetch the full user context including org and subscription.
        try {
            const { user: currentUser, organization: currentOrg, subscription: currentSub } = await api.fetchCurrentUser();
            completeLogin(currentUser, currentOrg, currentSub);
            return true;
        } catch (error) {
            console.error("Failed to fetch user data after MFA:", error);
            logout();
            return false;
        }
    }
    return false;
  };
  
  const refreshUser = useCallback(async () => {
    try {
      const { user: currentUser, organization: currentOrg, subscription: currentSub } = await api.fetchCurrentUser();
      setUser(currentUser);
      setOrganization(currentOrg);
      setSubscription(currentSub);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }, []);
  
  const cancelMfa = useCallback(() => {
    setMfaRequired(false);
    setMfaUser(null);
  }, []);

  const role = useMemo(() => user?.role || null, [user]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      organization,
      subscription,
      role, 
      login, 
      logout,
      refreshUser,
      isLoading,
      mfaRequired,
      mustChangePassword,
      loginWithGoogle,
      verifyMfa,
      cancelMfa,
      completePendingLogin,
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
