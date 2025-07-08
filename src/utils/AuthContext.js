// src/utils/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";

// ✅ 1. Context 생성
const AuthContext = createContext();

// ✅ 2. Provider 정의
export const AuthProvider = ({ children }) => {
  const [authorized, setAuthorized] = useState(null); // null = 로딩 중
  const [user, setUser] = useState(null);

  const fetchAuthUser = () => {
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
  };

  useEffect(() => {
    fetchAuthUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authorized, user, fetchAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ 3. useAuth 훅 export
export const useAuth = () => useContext(AuthContext);
