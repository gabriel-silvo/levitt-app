// src/contexts/AuthContext.tsx
import axios from 'axios';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from "../config/api";

interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
}

interface AuthContextData {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function loadData() {
      const storedToken = await SecureStore.getItemAsync('userToken');

      if (storedToken) {
        // Se encontrarmos um token, o colocamos no cabeçalho do Axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          // E AGORA BUSCAMOS OS DADOS DO USUÁRIO
          const response = await axios.get(`${API_URL}/me`);
          setUser(response.data); // Salvamos os dados do usuário no estado
          setToken(storedToken); // Confirmamos o token no estado
        } catch (error) {
          // Se o token for inválido, limpamos tudo
          console.error("Token inválido, fazendo logout.", error);
          logout(); 
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (token && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [token, loading, segments, router]); // <-- router adicionado aqui

  async function login(emailOrUsername: string, password: string) {
    const response = await axios.post(`${API_URL}/sessions`, { emailOrUsername, password });
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    await SecureStore.setItemAsync('userToken', newToken);
  }
  
  async function register(data: any) {
    const response = await axios.post(`${API_URL}/users`, data);
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    await SecureStore.setItemAsync('userToken', newToken);
  }

  async function logout() {
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    await SecureStore.deleteItemAsync('userToken');
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}