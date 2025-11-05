import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, DollarSign, Save, CheckCircle } from 'lucide-react-native';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { theme } from '../../config/theme';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { useSavings } from '../../hooks/useSavings';

export const MonthlyContributionConfigScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { monthlyContribution, updateMonthlyContribution, refresh } = useSavings();
  const [inputAmount, setInputAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sincronizar el input con el valor actual del hook
  useEffect(() => {
    setInputAmount(monthlyContribution > 0 ? monthlyContribution.toString() : '');
  }, [monthlyContribution]);

  // Recargar cuando la pantalla reciba foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refresh();
    });

    return unsubscribe;
  }, [navigation]);

  const handleSave = async () => {
    if (!user) return;

    const amount = parseFloat(inputAmount);
    
    // Validaciones mejoradas
    if (!inputAmount || isNaN(amount) || amount < 0) {
      Alert.alert('Error', 'Ingresa un monto válido (número mayor o igual a 0)');
      return;
    }

    if (amount > 10000000) {
      Alert.alert('Error', 'El monto no puede ser mayor a 10 millones');
      return;
    }

    try {
      setIsLoading(true);
      setSaveSuccess(false);

      // Usar el método del hook que actualiza inmediatamente
      await updateMonthlyContribution(amount);

      // Mostrar éxito
      setSaveSuccess(true);
      
      // Feedback al usuario
      if (Platform.OS === 'web') {
        alert('✅ Configuración guardada exitosamente');
      } else {
        Alert.alert('Éxito', `Aporte mensual configurado en ${formatCurrency(amount)}`);
      }

      // Recargar datos en el hook principal
      await refresh();

      // Esperar un momento para que el usuario vea el feedback antes de regresar
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      const errorMessage = error.message || 'No se pudo guardar la configuración';
      
      if (Platform.OS === 'web') {
        alert(`❌ ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedAmounts = [50000, 100000, 200000, 500000, 1000000];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary[600], theme.colors.secondary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurar Aporte Mensual</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.currentConfig}>
          <Text style={styles.currentConfigLabel}>Configuración actual:</Text>
          <Text style={styles.currentConfigAmount}>
            {formatCurrency(monthlyContribution)}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Explicación */}
        <Card style={styles.infoCard} variant="filled">
          <Text style={styles.infoTitle}>💡 ¿Cómo funciona?</Text>
          <Text style={styles.infoText}>
            Configura tu aporte mensual automático. Este monto se registrará automáticamente cada mes en tus ahorros.
          </Text>
          <Text style={styles.infoNote}>
            Puedes cambiar esta configuración en cualquier momento.
          </Text>
        </Card>

        {/* Formulario */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Monto del Aporte Mensual</Text>
          
          <Input
            label="Monto en COP"
            placeholder="Ej: 200000"
            value={inputAmount}
            onChangeText={(text) => {
              setInputAmount(text);
              setSaveSuccess(false);
            }}
            keyboardType="numeric"
            leftIcon={<DollarSign size={20} color={theme.colors.gray[400]} />}
            hint="Monto que aportarás cada mes automáticamente"
          />

          {/* Montos sugeridos */}
          <Text style={styles.suggestionsTitle}>Montos sugeridos:</Text>
          <View style={styles.suggestionsContainer}>
            {suggestedAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.suggestionChip,
                  inputAmount === amount.toString() && styles.suggestionChipSelected
                ]}
                onPress={() => {
                  setInputAmount(amount.toString());
                  setSaveSuccess(false);
                }}
              >
                <Text style={[
                  styles.suggestionText,
                  inputAmount === amount.toString() && styles.suggestionTextSelected
                ]}>
                  {formatCurrency(amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón guardar */}
          <Button
  title={saveSuccess ? "✅ Configuración Guardada" : "Guardar Configuración"}
  onPress={handleSave}
  loading={isLoading}
  disabled={saveSuccess}
  icon={saveSuccess ? <CheckCircle size={20} color={theme.colors.white} /> : <Save size={20} color={theme.colors.white} />}
  fullWidth
  style={{
    ...styles.saveButton,
    ...(saveSuccess ? styles.saveButtonSuccess : {})
  }}
/>
        </Card>

        {/* Información adicional */}
        <Card style={styles.noteCard} variant="outlined">
          <Text style={styles.noteTitle}>📋 Notas importantes:</Text>
          <Text style={styles.noteText}>
            • El aporte se registrará automáticamente el primer día de cada mes{'\n'}
            • Puedes desactivarlo configurando el monto en $0{'\n'}
            • Los intereses se calculan sobre tu saldo total incluyendo estos aportes{'\n'}
            • Puedes hacer aportes adicionales en cualquier momento
          </Text>
        </Card>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
    textAlign: 'center',
    flex: 1,
  },
  headerPlaceholder: {
    width: 44,
  },
  currentConfig: {
    alignItems: 'center',
  },
  currentConfigLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  currentConfigAmount: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  content: {
    padding: theme.spacing.lg,
  },
  infoCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[700],
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  infoNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary[600],
    fontStyle: 'italic',
  },
  formCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing.md,
  },
  suggestionsTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  suggestionChip: {
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  suggestionChipSelected: {
    backgroundColor: theme.colors.primary[100],
    borderColor: theme.colors.primary[500],
  },
  suggestionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[700],
    fontWeight: theme.fontWeight.medium,
  },
  suggestionTextSelected: {
    color: theme.colors.primary[700],
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
  saveButtonSuccess: {
    backgroundColor: theme.colors.success[600],
  },
  noteCard: {
    padding: theme.spacing.lg,
  },
  noteTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray[900],
    marginBottom: theme.spacing.sm,
  },
  noteText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[700],
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});