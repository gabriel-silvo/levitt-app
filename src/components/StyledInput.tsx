// src/components/StyledInput.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, useTheme } from 'react-native-paper';

type Props = React.ComponentProps<typeof PaperTextInput>;

export default function StyledInput(props: Props) {
  const theme = useTheme();

  return (
    <PaperTextInput
      style={[styles.input, { backgroundColor: theme.colors.surface }]}
      mode="outlined"
      // Aqui dizemos para usar a cor de borda que definimos no tema
      outlineColor={theme.colors.outline}
      // A cor ativa continua sendo nosso roxo primário
      activeOutlineColor={theme.colors.primary}
      theme={{ roundness: 24 }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
});