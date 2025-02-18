import {
  createContext,
  useState,
  type ReactNode,
  useContext,
  useEffect,
} from "react";
import type { User } from "../../../shared/types";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    const response = await fetch("http://localhost:3000/api/auth/me", {
      credentials: "include",
    });

    if (response.ok) {
      const userData: User | null = await response.json();
      setUser(userData);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
