import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SessionContextType {
  currentGroupId: string | null;
  setCurrentGroupId: (groupId: string | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  return (
    <SessionContext.Provider value={{ currentGroupId, setCurrentGroupId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
