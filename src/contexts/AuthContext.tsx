import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import bcrypt from "bcryptjs";

export type Role = "admin" | "user";

// Internal user record (stores passwordHash)
interface UserRecord {
  id: string;
  email: string;
  role: Role;
  passwordHash: string;
}

// Public user (no passwordHash)
export type User = { id: string; email: string; role: Role };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  users: User[];
  createUser: (email: string, password: string, role?: Role) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "magnet-admin-auth";
const USERS_KEY = "magnet-users";

// Optional env-configured admin (kept as fallback if present)
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH as
  | string
  | undefined;

function toPublicUser(u: UserRecord): User {
  return { id: u.id, email: u.email, role: u.role };
}

function genId() {
  try {
    // crypto.randomUUID may not be available in some browsers, fallback below
    // @ts-ignore
    if (typeof crypto !== "undefined" && crypto.randomUUID)
      return crypto.randomUUID();
  } catch {}
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRecords, setUserRecords] = useState<UserRecord[]>([]);

  // Initialize users
  useEffect(() => {
    const initializeUsers = () => {
      try {
        const savedUsersRaw = localStorage.getItem(USERS_KEY);
        let initialUsers: UserRecord[] = [];

        if (savedUsersRaw) {
          const parsed = JSON.parse(savedUsersRaw);
          if (Array.isArray(parsed)) {
            initialUsers = parsed as UserRecord[];
          }
        }

        // Ensure demo account exists
        const hasDemo = initialUsers.some(
          (u) => u.email.toLowerCase() === "demo@magnet.app",
        );
        if (!hasDemo) {
          const demoHash = bcrypt.hashSync("demo123", 10);
          initialUsers.push({
            id: genId(),
            email: "demo@magnet.app",
            role: "admin",
            passwordHash: demoHash,
          });
        }

        // If env-admin provided and not present in list, add it
        if (ADMIN_EMAIL && ADMIN_PASSWORD_HASH) {
          const exists = initialUsers.some(
            (u) =>
              u.email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase(),
          );
          if (!exists) {
            initialUsers.push({
              id: genId(),
              email: ADMIN_EMAIL,
              role: "admin",
              passwordHash: ADMIN_PASSWORD_HASH,
            });
          }
        }

        setUserRecords(initialUsers);

        // Force save to ensure persistence
        try {
          localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        } catch (saveError) {
          console.error("Failed to save initial users:", saveError);
        }
      } catch (e) {
        console.error("Failed to initialize users", e);
        // Fallback to just a demo user
        const demoHash = bcrypt.hashSync("demo123", 10);
        const fallbackUsers = [
          {
            id: genId(),
            email: "demo@magnet.app",
            role: "admin" as Role,
            passwordHash: demoHash,
          },
        ];
        setUserRecords(fallbackUsers);

        // Save fallback users
        try {
          localStorage.setItem(USERS_KEY, JSON.stringify(fallbackUsers));
        } catch (saveError) {
          console.error("Failed to save fallback users:", saveError);
        }
      }
    };

    initializeUsers();
  }, []);

  // Persist users with enhanced error handling and verification
  useEffect(() => {
    if (userRecords.length === 0) return; // Don't save empty array

    try {
      const dataToSave = JSON.stringify(userRecords);
      localStorage.setItem(USERS_KEY, dataToSave);

      // Verify the save was successful
      const verification = localStorage.getItem(USERS_KEY);
      if (verification !== dataToSave) {
        console.error("User data save verification failed");
        // Retry once
        setTimeout(() => {
          try {
            localStorage.setItem(USERS_KEY, dataToSave);
          } catch (retryError) {
            console.error("Retry save failed:", retryError);
          }
        }, 100);
      }
    } catch (e) {
      console.error("Failed to persist users", e);
      // Try to clear corrupted data and retry
      try {
        localStorage.removeItem(USERS_KEY);
        localStorage.setItem(USERS_KEY, JSON.stringify(userRecords));
      } catch (retryError) {
        console.error("Failed to recover from save error:", retryError);
      }
    }
  }, [userRecords]);

  // Initialize auth session with improved persistence
  useEffect(() => {
    if (userRecords.length === 0) return; // Wait for users to load

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as User;

        // Validate the saved user data
        if (parsed && parsed.id && parsed.email && parsed.role) {
          // Only restore if that user still exists in our records
          const exists = userRecords.find((u) => u.id === parsed.id);
          if (exists) {
            // Ensure the user data is up to date
            const updatedUser = {
              id: exists.id,
              email: exists.email,
              role: exists.role,
            };
            setUser(updatedUser);

            // Update localStorage with current user data
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
          } else {
            // User no longer exists, clear the session
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
          }
        } else {
          // Invalid user data, clear it
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      }
    } catch (e) {
      console.error("Failed to load auth state", e);
      // Clear potentially corrupted auth data
      try {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      } catch (clearError) {
        console.error("Failed to clear corrupted auth data:", clearError);
      }
    }
  }, [userRecords]);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Wait for users to be initialized
    if (userRecords.length === 0) {
      throw new Error(
        "Authentication system is still initializing. Please try again in a moment.",
      );
    }

    const record = userRecords.find(
      (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase(),
    );
    if (!record) {
      throw new Error(
        "Invalid email or password. Try demo@magnet.app with password demo123",
      );
    }

    const passwordMatch = await bcrypt.compare(password, record.passwordHash);
    if (!passwordMatch) {
      throw new Error(
        "Invalid email or password. Try demo@magnet.app with password demo123",
      );
    }

    const publicUser = toPublicUser(record);
    setUser(publicUser);

    // Enhanced session persistence
    try {
      const userData = JSON.stringify(publicUser);
      localStorage.setItem(STORAGE_KEY, userData);

      // Verify the save was successful
      const verification = localStorage.getItem(STORAGE_KEY);
      if (verification !== userData) {
        console.warn("Login session save verification failed, retrying...");
        // Retry once
        localStorage.setItem(STORAGE_KEY, userData);
      }
    } catch (saveError) {
      console.error("Failed to save login session:", saveError);
      // Still allow login to proceed, but warn user
      throw new Error(
        "Login successful but session may not persist. Please try again if you get logged out.",
      );
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear auth session:", e);
    }
  };

  const createUser = async (
    email: string,
    password: string,
    role: Role = "user",
  ) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || password.length < 3) {
      throw new Error("Invalid email or password too short");
    }

    const exists = userRecords.some(
      (u) => u.email.trim().toLowerCase() === trimmedEmail.toLowerCase(),
    );
    if (exists) {
      throw new Error("A user with that email already exists");
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser: UserRecord = {
      id: genId(),
      email: trimmedEmail,
      role,
      passwordHash: hash,
    };

    // Update state and force immediate persistence
    const updatedUsers = [...userRecords, newUser];
    setUserRecords(updatedUsers);

    // Force immediate save to ensure persistence
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    } catch (saveError) {
      console.error("Failed to save new user:", saveError);
      // Revert the state change if save failed
      setUserRecords(userRecords);
      throw new Error("Failed to save user. Please try again.");
    }
  };

  const deleteUser = async (id: string) => {
    if (!id) {
      throw new Error("User ID is required");
    }

    const target = userRecords.find((u) => u.id === id);
    if (!target) {
      throw new Error("User not found");
    }

    // Prevent deleting your own account while logged in
    if (user?.id === id) {
      throw new Error("You cannot delete your currently signed-in account");
    }

    // Prevent removing last admin
    const adminCount = userRecords.filter((u) => u.role === "admin").length;
    if (target.role === "admin" && adminCount <= 1) {
      throw new Error("At least one admin user must remain");
    }

    // Update state and force immediate persistence
    const updatedUsers = userRecords.filter((u) => u.id !== id);
    setUserRecords(updatedUsers);

    // Force immediate save to ensure persistence
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    } catch (saveError) {
      console.error("Failed to save after user deletion:", saveError);
      // Revert the state change if save failed
      setUserRecords(userRecords);
      throw new Error("Failed to delete user. Please try again.");
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    users: userRecords.map(toPublicUser),
    createUser,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
