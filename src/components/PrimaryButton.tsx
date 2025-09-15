// src/components/PrimaryButton.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

type Props = React.ComponentProps<typeof PaperButton>;

export default function PrimaryButton(props: Props) {
  return (
    <PaperButton
      style={styles.button}
      labelStyle={styles.text}
      mode="contained"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});