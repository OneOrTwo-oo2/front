import { createContext, useState, useEffect, useContext } from "react";
import apiClient from "../api/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authorized, setAuthorized] = useState(null); // true/false
  const [isAuthLoaded, setIsAuthLoaded] = useState(false); // ✅ 로딩 완료 여부
  const [user, setUser] = useState(null);

  const fetchAuthUser = async () => {
    try {
      const res = await apiClient.get("/auth/user", { withCredentials: true });
      setAuthorized(true);
      setUser(res.data);
    } catch (err) {
      setAuthorized(false);
      setUser(null);
    } finally {
      setIsAuthLoaded(true); // ✅ 언제든 로딩 완료 플래그는 true
    }
  };

  useEffect(() => {
    fetchAuthUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ authorized, user, fetchAuthUser, isAuthLoaded }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
