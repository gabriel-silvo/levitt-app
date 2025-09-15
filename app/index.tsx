// app/index.tsx
import { Redirect } from 'expo-router';

export default function StartPage() {
  // Redireciona o usuário da rota raiz ("/") para a tela de login.
  return <Redirect href="/login" />;
}