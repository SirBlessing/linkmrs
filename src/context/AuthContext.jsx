import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]    = useState(null);
  const [shop,      setShop]    = useState(null);
  const [isLoading, setLoading] = useState(true); // true until we've checked the token

  // On mount: if a JWT is stored, validate it and restore the session
  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }

    api.me()
      .then(({ user: u, shop: s }) => { setUser(u); setShop(s); })
      .catch(() => setToken(null))          // token invalid or expired → clear it
      .finally(() => setLoading(false));
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    setToken(data.token);
    setUser(data.user);
    setShop(data.shop);
    return data;
  }, []);

  const login = useCallback(async (payload) => {
    const data = await api.login(payload);
    setToken(data.token);
    setUser(data.user);
    setShop(data.shop);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setShop(null);
  }, []);

  // Called by SettingsPage after a successful PATCH /api/shops/me
  const updateShop = useCallback(async (patch) => {
    const data = await api.updateShop(patch);
    setShop(data.shop);
    return data.shop;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      shop,
      isAuthenticated: Boolean(user),
      isLoading,
      register,
      login,
      logout,
      updateShop,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
