import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/";
  }, []);

  const loadUser = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem("user"));

    if (!stored?.token) {
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode(stored.token);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      setUser(stored);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);