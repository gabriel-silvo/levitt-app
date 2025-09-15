// src/components/StyledInput.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, useTheme } from 'react-native-paper';

// Aqui pegamos todas as props do TextInput original, incluindo 'style'
type Props = React.ComponentProps<typeof PaperTextInput>;

export default function StyledInput({ style, ...restOfProps }: Props) {
  const theme = useTheme();

  return (
    <PaperTextInput
      // O truque está aqui: criamos um array de estilos.
      // Ele aplica nossos estilos base e DEPOIS aplica qualquer estilo que vier de fora.
      style={[styles.input, { backgroundColor: theme.colors.surface }, style]}
      mode="outlined"
      outlineColor={theme.colors.outline}
      activeOutlineColor={theme.colors.primary}
      theme={{ roundness: 24 }}
      // O '...restOfProps' passa todo o resto (label, value, etc.)
      {...restOfProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
});