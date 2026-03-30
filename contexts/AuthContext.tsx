import React, { createContext, ReactNode, useContext, useState } from "react";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: your actual API call here
      // const response = await fetch('YOUR_API_URL/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });

      // simulate login validation
      if (email && password) {
        // simulate user data
        const mockUser: User = {
          id: "1",
          username: email.split("@")[0],
          email: email,
        };
        await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate network delay
        setUser(mockUser);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      // TODO: your actual API call here
      // const response = await fetch('YOUR_API_URL/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, email, password })
      // });

      // simulate registration
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate network delay
      if (username && email && password) {
        const mockUser: User = {
          id: "1",
          username,
          email,
        };

        setUser(mockUser);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
