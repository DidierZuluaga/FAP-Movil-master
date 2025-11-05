import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mail,
  Lock,
  User as UserIcon,
  Calendar,
  Shield,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { theme } from '../../config/theme';

const { width } = Dimensions.get('window');

export const RegisterScreen = ({ navigation }: any) => {
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    role: 'asociado' as 'asociado' | 'cliente',
  });

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos una letra mayúscula';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos un número';
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos un carácter especial (!@#$%^&*)';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const age = Math.floor(
        (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      
      if (isNaN(birthDate.getTime())) {
        newErrors.dateOfBirth = 'Fecha no válida';
      } else if (age < 18) {
        newErrors.dateOfBirth = 'Debes ser mayor de 18 años';
      } else if (age > 120) {
        newErrors.dateOfBirth = 'Fecha no válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (Platform.OS === 'web') {
        alert(`❌ ${firstError}`);
      } else {
        Alert.alert('Error', firstError as string);
      }
      return;
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        new Date(formData.dateOfBirth)
      );

      if (Platform.OS === 'web') {
        alert('✅ ¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
      } else {
        Alert.alert(
          '¡Éxito!',
          'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }

    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(`❌ ${error.message || 'Error al crear la cuenta'}`);
      } else {
        Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
      }
    }
  };

  const handleDateChange = (text: string) => {
    let formatted = text.replace(/[^0-9-]/g, '');
    
    if (formatted.length === 4 && !formatted.includes('-')) {
      formatted += '-';
    } else if (formatted.length === 7 && formatted.split('-').length === 2) {
      formatted += '-';
    }
    
    formatted = formatted.slice(0, 10);
    
    setFormData({ ...formData, dateOfBirth: formatted });
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'Mínimo 8 caracteres' },
    { met: /[A-Z]/.test(formData.password), text: 'Una letra mayúscula' },
    { met: /[0-9]/.test(formData.password), text: 'Un número' },
    { met: /[!@#$%^&*]/.test(formData.password), text: 'Un carácter especial' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Únete a FAP Móvil y toma el control de tus finanzas
            </Text>
          </View>
        </LinearGradient>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <Input
              label="Nombre Completo"
              placeholder="Ej: Didier Zuluaga"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
              leftIcon={<UserIcon size={20} color={theme.colors.gray[400]} />}
              autoCapitalize="words"
            />

            <Input
              label="Correo Electrónico"
              placeholder="Didier@ejemplo.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text.trim() })}
              error={errors.email}
              leftIcon={<Mail size={20} color={theme.colors.gray[400]} />}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Fecha de Nacimiento"
              placeholder="AAAA-MM-DD"
              value={formData.dateOfBirth}
              onChangeText={handleDateChange}
              error={errors.dateOfBirth}
              leftIcon={<Calendar size={20} color={theme.colors.gray[400]} />}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Seguridad</Text>

            <Input
              label="Contraseña"
              placeholder="Crea una contraseña segura"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              error={errors.password}
              leftIcon={<Lock size={20} color={theme.colors.gray[400]} />}
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={theme.colors.gray[400]} />
                  ) : (
                    <Eye size={20} color={theme.colors.gray[400]} />
                  )}
                </TouchableOpacity>
              }
            />

            {formData.password && (
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>La contraseña debe contener:</Text>
                {passwordRequirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <CheckCircle 
                      size={16} 
                      color={req.met ? '#10B981' : theme.colors.gray[400]} 
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: req.met ? '#10B981' : theme.colors.gray[500] }
                    ]}>
                      {req.text}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Input
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              error={errors.confirmPassword}
              leftIcon={<Lock size={20} color={theme.colors.gray[400]} />}
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={theme.colors.gray[400]} />
                  ) : (
                    <Eye size={20} color={theme.colors.gray[400]} />
                  )}
                </TouchableOpacity>
              }
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Tipo de Cuenta</Text>
            
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  formData.role === 'asociado' && styles.roleCardActive,
                ]}
                onPress={() => setFormData({ ...formData, role: 'asociado' })}
              >
                <View style={[
                  styles.roleIcon,
                  { backgroundColor: formData.role === 'asociado' ? '#667eea' : theme.colors.gray[100] }
                ]}>
                  <Shield 
                    size={24} 
                    color={formData.role === 'asociado' ? theme.colors.white : theme.colors.gray[600]} 
                  />
                </View>
                <View style={styles.roleContent}>
                  <Text style={[
                    styles.roleTitle,
                    formData.role === 'asociado' && styles.roleTitleActive
                  ]}>
                    Asociado
                  </Text>
                  <Text style={styles.roleDescription}>
                    Acceso completo a ahorros y préstamos con tasas preferenciales
                  </Text>
                </View>
                {formData.role === 'asociado' && (
                  <CheckCircle size={20} color="#10B981" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  formData.role === 'cliente' && styles.roleCardActive,
                ]}
                onPress={() => setFormData({ ...formData, role: 'cliente' })}
              >
                <View style={[
                  styles.roleIcon,
                  { backgroundColor: formData.role === 'cliente' ? '#667eea' : theme.colors.gray[100] }
                ]}>
                  <UserIcon 
                    size={24} 
                    color={formData.role === 'cliente' ? theme.colors.white : theme.colors.gray[600]} 
                  />
                </View>
                <View style={styles.roleContent}>
                  <Text style={[
                    styles.roleTitle,
                    formData.role === 'cliente' && styles.roleTitleActive
                  ]}>
                    Cliente
                  </Text>
                  <Text style={styles.roleDescription}>
                    Servicios básicos con un asociado como codeudor
                  </Text>
                </View>
                {formData.role === 'cliente' && (
                  <CheckCircle size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
          />

          <Text style={styles.termsText}>
            Al crear una cuenta, aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos de Servicio</Text> y{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  form: {
    padding: theme.spacing.lg,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray[900],
    marginBottom: 20,
  },
  passwordRequirements: {
    backgroundColor: theme.colors.gray[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  },
  roleSelector: {
    gap: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.gray[50],
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardActive: {
    backgroundColor: '#F0F4FF',
    borderColor: '#667eea',
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray[700],
    marginBottom: 4,
  },
  roleTitleActive: {
    color: '#667eea',
  },
  roleDescription: {
    fontSize: 13,
    color: theme.colors.gray[500],
    lineHeight: 18,
  },
  termsText: {
    fontSize: 13,
    color: theme.colors.gray[500],
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 20,
    marginBottom: 32,
  },
  termsLink: {
    color: '#667eea',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: theme.colors.gray[600],
  },
  loginLink: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 4,
  },
});