// contexts/SessionContext.tsx
import { authClient } from "@/lib/auth/auth-client";
import { createContext, ReactNode, useContext } from "react";

interface SessionContextType {
  data: any;
  isPending: boolean;
  isRefetching: boolean;
  error: any;
  refetch: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: session,
    isPending,
    isRefetching,
    error,
    refetch,
  } = authClient.useSession();

  return (
    <SessionContext.Provider
      value={{ data: session, isPending, isRefetching, error, refetch }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
