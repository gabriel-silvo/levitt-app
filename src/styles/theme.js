// src/theme.js
import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6A35F4',      // Nosso roxo vibrante
    background: '#1E1E1E',  // Cinza escuro para o fundo
    surface: '#2A2A2A',      // Um cinza um pouco mais claro
    // A cor 'onSurfaceVariant' já existe no DefaultTheme e é um cinza perfeito para a linha
    outline: '#444444',
  },
};