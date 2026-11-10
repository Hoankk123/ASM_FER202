import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function safeAtob(b64) {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch (e) {
    try {
      return atob(b64);
    } catch (err) {
      return '';
    }
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || null);
  const [user, setUser] = useState(null);

  // Decode basic user info from token (mock: base64, real: JWT payload)
  useEffect(() => {
    if (token) {
      try {
        // Try to decode JWT payload (second segment)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(safeAtob(parts[1]));
          setUser({
            username: payload.sub || payload.username || 'user',
            role: payload.role || 'customer',
          });
        } else {
          // Mock token fallback (base64 string like "admin:mock-token")
          const decoded = safeAtob(token);
          const username = decoded.split(':')[0];
          setUser({
            username: username,
            role: username === 'admin' ? 'admin' : 'customer',
          });
        }
      } catch (e) {
        setUser({ username: 'user', role: 'customer' });
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const loginAction = (newToken) => {
    localStorage.setItem('jwtToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('cart');
    localStorage.removeItem('jwtToken');
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ token, user, isAdmin, isAuthenticated, login: loginAction, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { AuthContext };
