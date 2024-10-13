import React, { createContext, useState, ReactNode, useContext } from 'react';

// Definindo o tipo do usuário
type User = {
  id: string;
  email: string;
};

// Definindo o tipo do contexto
type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

// Criando o contexto com valores iniciais
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook para usar o contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Provider que irá envolver a aplicação e fornecer o estado do usuário
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
