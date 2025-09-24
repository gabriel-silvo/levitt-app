// src/contexts/AuthContext.tsx
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import axios from 'axios';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { API_URL } from "../config/api";

interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  avatarUrl: string;
}

// Defina a estrutura do nosso versículo
interface DailyVerse {
  verseText: string;
  verseReference: string;
}

interface AuthContextData {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  signInWithGoogle: () => Promise<void>;
  dailyVerse: DailyVerse | null; // <-- Adicione o versículo aqui
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null); // <-- Novo estado

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
    });
  }, []);

  useEffect(() => {
    async function loadData() {
      const storedToken = await SecureStore.getItemAsync('userToken');

      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          // AGORA CHAMAMOS A NOVA ROTA /initial-data
          const response = await axios.get(`${API_URL}/initial-data`);

          // E salvamos AMBOS os dados de uma vez
          setUser(response.data.user);
          setDailyVerse(response.data.dailyVerse);
          setToken(storedToken);
        } catch (error) {
          console.error("Token inválido ou falha ao buscar dados, fazendo logout.", error);
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

  // --- INÍCIO DA NOVA LÓGICA INTEGRADA ---

  // Esta função valida o token com nosso backend (o destino final)
  async function validateGoogleToken(idToken: string) {
    try {
      const apiResponse = await axios.post(`${API_URL}/auth/google`, { idToken });
      const { token: newToken, user: userData } = apiResponse.data;

      // Salva o token do LEVITT e os dados do usuário no contexto
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      await SecureStore.setItemAsync('userToken', newToken);

    } catch (error) {
      console.error("Erro ao validar token com backend", error);
      Alert.alert('Não foi possível fazer login com o Google.');
      // Importante: fazemos logout do Google se o nosso backend falhar
      await GoogleSignin.signOut();
    }
  }

  // Esta é a sua função que já está funcionando, agora dentro do contexto.
  // A única mudança é que, no final, ela chama a 'validateGoogleToken'.
  async function signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        await validateGoogleToken(idToken!);
      } else {
        throw new Error("Não foi possível obter o idToken do Google.");
      }
    } catch (error: any) {
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log('Login com Google cancelado pelo usuário.');
      } else {
        console.error("Erro no signInWithGoogle:", error);
        Alert.alert("Erro", "Ocorreu um erro durante o login com o Google.");
      }
    }
  }
  // --- FIM DA NOVA LÓGICA ---

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
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, signInWithGoogle, dailyVerse }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}