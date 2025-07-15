// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false); // ✅ 추가

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');

    if (token && role) {
      setIsAuthenticated(true);
      setUser({ role, email });
    }
    setIsInitialized(true); // ✅ 초기화 완료
  }, []);

  const login = (token, userInfo) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userInfo.role);
    localStorage.setItem('email', userInfo.email);
    console.log("로그인된 userInfo:", userInfo);

    setIsAuthenticated(true);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    setUser(null);
    navigator('/');
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isInitialized, user, login, logout }}
    >
      {isInitialized ? children : <div>로딩 중...</div>} {/* ✅ 초기화 전 렌더링 막기 */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
