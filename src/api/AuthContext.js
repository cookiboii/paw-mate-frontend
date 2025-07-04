// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email'); // 옵션

    if (token && role) {
      setIsAuthenticated(true);
      setUser({ role, email }); // ✅ role 복원
    }
  }, []);

  const login = (token, userInfo) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userInfo.role);
    localStorage.setItem('email', userInfo.email);
    console.log("로그인된 userInfo:", userInfo);
 // 옵션
    setIsAuthenticated(true);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
