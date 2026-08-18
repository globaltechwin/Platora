"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_CREDENTIALS = {
  username: "demosite",
  password: "demosite",
};

const DEMO_USER: User = {
  username: "demosite",
  name: "Demo User",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("platora_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const router = useRouter();

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (
        username === VALID_CREDENTIALS.username &&
        password === VALID_CREDENTIALS.password
      ) {
        setUser(DEMO_USER);
        localStorage.setItem("platora_user", JSON.stringify(DEMO_USER));
        document.cookie = "platora_auth=1; path=/; max-age=86400";
        router.push("/welcome");
        return true;
      }
      return false;
    },
    [router]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("platora_user");
    document.cookie = "platora_auth=; path=/; max-age=0";
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
