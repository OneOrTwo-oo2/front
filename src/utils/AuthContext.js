// src/utils/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authorized, setAuthorized] = useState(null); // null = 로딩 중
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setAuthorized(true);
        setUser(data);
      })
      .catch(() => {
        setAuthorized(false);
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ authorized, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
