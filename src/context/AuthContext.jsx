import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [user, setUser] = useState(() => {
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const provider = localStorage.getItem('provider');
    return role ? { role, email, name, provider } : null;
  });

  const login = (token, userInfo = {}) => {
    localStorage.setItem('token', token);
    if (userInfo.role) localStorage.setItem('role', userInfo.role);
    if (userInfo.email) localStorage.setItem('email', userInfo.email);
    if (userInfo.name) localStorage.setItem('name', userInfo.name);
    if (userInfo.provider) localStorage.setItem('provider', userInfo.provider);
    setIsAuthenticated(true);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    localStorage.removeItem('provider');
    localStorage.removeItem('refreshToken');
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

