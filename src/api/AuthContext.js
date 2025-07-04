import { createContext, useContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode"; // ✅ 추가

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const login = (token) => {
    localStorage.setItem("token", token);
    console.log(token);
    
    setIsAuthenticated(true);

    try {
      const decoded = jwtDecode(token); // ✅ JWT 디코딩
      setUser(decoded); // 예: { email, role, isAdmin 등 }
    } catch (e) {
      console.error("토큰 디코딩 실패:", e);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (e) {
        console.error("초기 토큰 디코딩 실패:", e);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
