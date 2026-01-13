import { createContext, useState } from "react";

// 1. Create the Context (The "Container")
export const AuthContext = createContext();

// 2. Create the Provider (The "Sender")
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    // CRITICAL LINE: You must pass BOTH 'user' and 'setUser' here
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};