import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react-native';
import { theme } from '../../config/theme';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ variant, title, message }) => {
  const Icon = {
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
  }[variant];

  const colors = {
    info: {
      bg: theme.colors.secondary[50],
      border: theme.colors.secondary[200],
      text: theme.colors.secondary[800],
      icon: theme.colors.secondary[600],
    },
    success: {
      bg: theme.colors.success[50],
      border: theme.colors.success[200],
      text: theme.colors.success[800],
      icon: theme.colors.success[600],
    },
    warning: {
      bg: theme.colors.warning[50],
      border: theme.colors.warning[200],
      text: theme.colors.warning[800],
      icon: theme.colors.warning[600],
    },
    error: {
      bg: theme.colors.error[50],
      border: theme.colors.error[200],
      text: theme.colors.error[800],
      icon: theme.colors.error[600],
    },
  }[variant];

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.bg, borderColor: colors.border }
    ]}>
      <Icon size={20} color={colors.icon} />
      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
        )}
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.xs,
  },
  message: {
    fontSize: theme.fontSize.sm,
  },
});