import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap da sessão
  useEffect(() => {
    try {
      const token = localStorage.getItem('@veloma:access_token');
      const savedUser = localStorage.getItem('@veloma:user');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = () => {
    localStorage.removeItem('@veloma:access_token');
    localStorage.removeItem('@veloma:refresh_token');
    localStorage.removeItem('@veloma:user');
    setUser(null);
  };

  const login = async ({ email, password }) => {
    try {
      const { data } = await authService.login({ email, password });

      const { access, refresh, user } = data;

      localStorage.setItem('@veloma:access_token', access);
      localStorage.setItem('@veloma:refresh_token', refresh);
      localStorage.setItem('@veloma:user', JSON.stringify(user));

      setUser(user);
      return { success: true, user };
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'Credenciais inválidas.';
      return { success: false, message };
    }
  };

  const register = async (payload) => {
    try {
      const response = await authService.register(payload);

      console.log('REGISTER RESPONSE:', response);

      const { access, refresh, user } = response.data || {};

      // Se backend já devolve tokens (como você mostrou)
      if (access) {
        localStorage.setItem('@veloma:access_token', access);
        localStorage.setItem('@veloma:refresh_token', refresh);
        localStorage.setItem('@veloma:user', JSON.stringify(user));
        setUser(user);
      }

      return { success: true, user };
    } catch (error) {
      console.error('REGISTER ERROR FULL:', error);
      console.error('REGISTER ERROR RESPONSE:', error.response);

      const apiData = error.response?.data;

      return {
        success: false,
        message:
          apiData?.detail ||
          apiData?.email?.[0] ||
          apiData?.non_field_errors?.[0] ||
          apiData?.password?.[0] ||
          'Erro ao criar conta.',
      };
    }
  };


  const logout = () => {
    clearSession();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
