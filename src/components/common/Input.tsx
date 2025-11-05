import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { theme } from '../../config/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerStyle,
  style,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(!!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  // ✅ Estilos condicionales para web
  const getInputStyles = () => {
    const baseStyles = [styles.input, style];
    
    if (Platform.OS === 'web') {
      // ✅ Para web, agregamos estilos específicos como objeto
      baseStyles.push({
        outlineStyle: 'none',
        lineHeight: 24,
        height: '100%',
        paddingTop: 0,
        paddingBottom: 0,
      } as any); // Usamos 'as any' para evitar errores de TypeScript
    }
    
    return baseStyles;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={getInputStyles()}
          placeholderTextColor={theme.colors.gray[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.rightIcon}
          >
            {isSecure ? (
              <EyeOff size={20} color={theme.colors.gray[400]} />
            ) : (
              <Eye size={20} color={theme.colors.gray[400]} />
            )}
          </TouchableOpacity>
        )}
        
        {!secureTextEntry && rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 56, // ✅ Altura mínima
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: theme.colors.error[500],
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.gray[900],
    paddingVertical: theme.spacing.md,
    // ✅ Para Android/iOS
    ...(Platform.OS !== 'web' && {
      textAlignVertical: 'center',
      includeFontPadding: false,
    }),
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
  error: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error[600],
    marginTop: theme.spacing.xs,
  },
  hint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
  },
});