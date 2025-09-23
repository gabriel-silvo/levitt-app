// src/theme.js
import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
         // Nosso roxo vibrante
    background: '#1E1E1E',  // Cinza escuro para o fundo
    outline: '#444444',
    primary: '#6A35F4',
    reference: '#A0A0A0',
    surface: '#2C2C2E',  // Um cinza um pouco mais claro -> 2A2A2A
    white: '#FFFFFF',
  },
};