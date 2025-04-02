import { createContext, useState, useContext, type ReactNode } from "react";
import { UserContext } from "@shared/types";

interface AuthContextType {
  user: UserContext | null;
  setUser: (user: UserContext | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserContext | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
