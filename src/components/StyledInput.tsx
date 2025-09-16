// src/components/StyledInput.tsx
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, useTheme } from 'react-native-paper';

type Props = React.ComponentProps<typeof PaperTextInput>;

// A MUDANÇA ESTÁ AQUI: Nós "capturamos" a prop 'secureTextEntry'
// para que ela не faça parte do '...restOfProps'
export default function StyledInput({ style, secureTextEntry, ...restOfProps }: Props) {
  const theme = useTheme();
  
  // Agora, a variável 'secureTextEntry' aqui se refere à prop que veio de fora (true)
  const isPasswordField = secureTextEntry;

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  return (
    <PaperTextInput
      style={[styles.input, { backgroundColor: theme.colors.surface }, style]}
      mode="outlined"
      outlineColor={theme.colors.outline}
      activeOutlineColor={theme.colors.primary}
      theme={{ roundness: 24 }}
      
      // Nossa lógica agora é a única fonte da verdade para esta prop.
      // Ela não será mais sobrescrita.
      secureTextEntry={isPasswordField && !isPasswordVisible}
      
      right={
        isPasswordField ? (
          <PaperTextInput.Icon
            icon={isPasswordVisible ? "eye-off" : "eye"}
            onPress={() => setPasswordVisible((prev) => !prev)}
          />
        ) : null
      }
      
      {...restOfProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
});