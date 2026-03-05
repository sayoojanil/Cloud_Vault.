import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/* ---------------------------------------------
   Types
--------------------------------------------- */
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  storageUsed: number;
  storageLimit: number;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginAsGuest: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  // New password reset methods
  forgotPassword: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
}

/* ---------------------------------------------
   Context
--------------------------------------------- */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------------------------------------------
   API CONFIG
--------------------------------------------- */
const API_BASE = import.meta.env.VITE_API_URL || "https://backend-digilocker-4.onrender.com";

const LOGIN_URL = `${API_BASE}/loginWithEmail`;
const SIGNUP_URL = `${API_BASE}/auth/signup`;
const FORGOT_PASSWORD_URL = `${API_BASE}/forgot-password`;
const VERIFY_OTP_URL = `${API_BASE}/verify-otp`;
const RESET_PASSWORD_URL = `${API_BASE}/reset-password`;

/* ---------------------------------------------
   Guest User
--------------------------------------------- */
const GUEST_USER: User = {
  id: "guest",
  name: "Guest User",
  email: "guest@vault.app",
  phone: "",
  storageUsed: 0,
  storageLimit: 100 * 1024 * 1024, // 100MB
  isGuest: true,
};

/* ---------------------------------------------
   Provider
--------------------------------------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------------------------------------------
     Restore Session
  --------------------------------------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("vault_user");
    const token = localStorage.getItem("vault_token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }

    setIsLoading(false);
  }, []);

  /* ---------------------------------------------
     LOGIN
  --------------------------------------------- */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        const res = await fetch(LOGIN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Login failed" }));
          const errorMessage = errorData.message || "Invalid credentials";
          console.error("Login failed:", errorMessage);
          throw new Error(errorMessage);
        }

        const data = await res.json();

        if (!data.success || !data.token || !data.user) {
          console.error("Invalid response format:", data);
          throw new Error("Invalid response from server");
        }

        localStorage.setItem("vault_token", data.token);
        localStorage.setItem("vault_user", JSON.stringify(data.user));

        setUser(data.user);
        return true;
      } catch (err: any) {
        console.error("Login failed:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* ---------------------------------------------
     SIGNUP
  --------------------------------------------- */
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        const res = await fetch(SIGNUP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Signup failed" }));
          const errorMessage = errorData.message || "Signup failed";
          console.error("Signup failed:", errorMessage);
          throw new Error(errorMessage);
        }

        const data = await res.json();

        if (!data.success || !data.token || !data.user) {
          console.error("Invalid response format:", data);
          throw new Error("Invalid response from server");
        }

        localStorage.setItem("vault_token", data.token);
        localStorage.setItem("vault_user", JSON.stringify(data.user));

        setUser(data.user);
        return true;
      } catch (err: any) {
        console.error("Signup failed:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* ---------------------------------------------
     LOGOUT
  --------------------------------------------- */
  const logout = useCallback(() => {
    localStorage.removeItem("vault_token");
    localStorage.removeItem("vault_user");
    setUser(null);
  }, []);

  /* ---------------------------------------------
     GUEST LOGIN
  --------------------------------------------- */
  const loginAsGuest = useCallback(() => {
    localStorage.removeItem("vault_token");
    localStorage.setItem("vault_user", JSON.stringify(GUEST_USER));
    setUser(GUEST_USER);
  }, []);

  /* ---------------------------------------------
     UPDATE USER
  --------------------------------------------- */
  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("vault_user", JSON.stringify(updatedUser));
    }
  }, [user]);

  /* ---------------------------------------------
     FORGOT PASSWORD - Request OTP
  --------------------------------------------- */
  const forgotPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const res = await fetch(FORGOT_PASSWORD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      return true;
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---------------------------------------------
     VERIFY OTP
  --------------------------------------------- */
  const verifyOTP = useCallback(async (email: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const res = await fetch(VERIFY_OTP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      return true;
    } catch (err: any) {
      console.error('OTP verification failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---------------------------------------------
     RESET PASSWORD
  --------------------------------------------- */
  const resetPassword = useCallback(async (
    email: string, 
    otp: string, 
    newPassword: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const res = await fetch(RESET_PASSWORD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return true;
    } catch (err: any) {
      console.error('Reset password failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---------------------------------------------
     Context Value
  --------------------------------------------- */
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    loginAsGuest,
    updateUser,
    isAuthenticated: !!user && !user.isGuest,
    // New password reset methods
    forgotPassword,
    verifyOTP,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ---------------------------------------------
   Hook
--------------------------------------------- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}