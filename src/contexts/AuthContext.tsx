import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import bcrypt from "bcryptjs";

type User = { email: string; role: "admin" };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH as
  | string
  | undefined;

const STORAGE_KEY = "magnet-admin-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as User;
        setUser(parsed);
      }
    } catch (e) {
      console.error("Failed to load auth state", e);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
      throw new Error("Admin credentials are not configured.");
    }

    const emailMatch =
      email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
    const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!emailMatch || !passwordMatch) {
      throw new Error("Invalid credentials");
    }

    const newUser: User = { email: ADMIN_EMAIL, role: "admin" };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
