import { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../api/apiClient"; // ✅ axios client import

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authorized, setAuthorized] = useState(null); // null = 로딩 중
  const [user, setUser] = useState(null);

  const fetchAuthUser = async () => {
    try {
      const res = await apiClient.get("/auth/user");
      setAuthorized(true);
      setUser(res.data);
    } catch (err) {
      setAuthorized(false);
      setUser(null);
    }
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

export const useAuth = () => useContext(AuthContext);
