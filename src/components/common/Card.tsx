import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../config/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = theme.spacing.md,
  variant = 'elevated',
}) => {
  return (
    <View style={[
      styles.card,
      styles[variant],
      { padding },
      style,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.xl,
  },
  elevated: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.md,
  },
  outlined: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  filled: {
    backgroundColor: theme.colors.gray[50],
  },
});