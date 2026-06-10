import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [user, setUser] = useState(() => {
    const role = localStorage.getItem('role');
    return role ? { role } : null;
  });

  const login = (token, userInfo) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userInfo.role); // ✅ role 저장
    setIsAuthenticated(true);
    setUser(userInfo); // ✅ user 상태 저장
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('provider');
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
