import { notificationsService } from '../../services/firestore/notificationsService';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DollarSign,
  Plus,
  TrendingUp,
  ArrowDownRight,
  Calendar,
  Search,
  X,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { theme } from '../../config/theme';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useSavings } from '../../hooks/useSavings';

// CAMBIA ESTA LÍNEA: Añade { navigation }
export const SavingsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { 
    totalBalance, 
    interests, 
    monthlyContribution,
    savings,
    createSaving,
    isLoading: savingsLoading,
    refresh  // ← CORREGIDO: con coma y en línea correcta
  } = useSavings();

  // AÑADE ESTE USEEFFECT COMPLETO
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Savings: Recargando datos...');
      refresh();
    });

    return unsubscribe;
  }, [navigation, refresh]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState<any>({});

  // Validar formulario
  const validateForm = () => {
    const errors: any = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Ingresa un monto válido';
    }

    if (!formData.description.trim()) {
      errors.description = 'Ingresa una descripción';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar nuevo aporte
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      
      const amount = parseFloat(formData.amount);
      
      console.log('💾 Guardando aporte:', { userId: user!.id, amount, description: formData.description });
      
      // Usar el método del hook
      await createSaving(amount, formData.description);

      console.log('✅ Aporte guardado');

      // Crear notificación automática
      try {
        await notificationsService.notifySavingConfirmed(user!.id, amount);
        console.log('✅ Notificación creada');
      } catch (notifError) {
        console.warn('⚠️ Error creando notificación (no crítico):', notifError);
      }

      // Mostrar mensaje de éxito
      if (Platform.OS === 'web') {
        alert('✅ Aporte registrado exitosamente');
      } else {
        Alert.alert('Éxito', 'Aporte registrado exitosamente');
      }

      // Limpiar formulario
      setFormData({ amount: '', description: '' });
      setShowAddModal(false);

      console.log('✅ Datos actualizados automáticamente');
    } catch (error: any) {
      console.error('❌ Error al guardar:', error);
      if (Platform.OS === 'web') {
        alert(`❌ Error: ${error.message}`);
      } else {
        Alert.alert('Error', error.message || 'No se pudo guardar el aporte. Intenta de nuevo.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar transacciones
  const filteredTransactions = savings.filter((saving) =>
    saving.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcular crecimiento (puedes ajustar esta lógica)
  const growth = savings.length > 0 ? 8.5 : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.success[600], theme.colors.success[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Mis Ahorros</Text>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Total Acumulado</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(totalBalance)}
            </Text>
            <View style={styles.balanceFooter}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Intereses</Text>
                <Text style={styles.balanceItemValue}>
                  {formatCurrency(interests)}
                </Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Crecimiento</Text>
                <View style={styles.growthContainer}>
                  <TrendingUp size={16} color={theme.colors.white} />
                  <Text style={styles.balanceItemValue}>
                    +{growth}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statIcon}>
              <DollarSign size={24} color={theme.colors.success[600]} />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(monthlyContribution)}
            </Text>
            <Text style={styles.statLabel}>Aporte Mensual Configurado</Text>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <View style={[styles.statIcon, { backgroundColor: theme.colors.primary[100] }]}>
              <TrendingUp size={24} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(interests)}
            </Text>
            <Text style={styles.statLabel}>Total Intereses</Text>
          </Card>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Add Button */}
          <Button
            title="Registrar Nuevo Aporte"
            onPress={() => setShowAddModal(true)}
            icon={<Plus size={20} color={theme.colors.white} />}
            fullWidth
          />

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={20} color={theme.colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar transacciones..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.gray[400]}
            />
          </View>

          {/* Transactions List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial de Aportes</Text>
            <Text style={styles.transactionCount}>
              {filteredTransactions.length} registros
            </Text>
          </View>

          {savingsLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          ) : filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No se encontraron transacciones' : 'No tienes aportes registrados. ¡Registra tu primer aporte!'}
              </Text>
            </View>
          ) : (
            filteredTransactions.map((saving) => (
              <Card key={saving.id} style={styles.transactionCard} variant="outlined">
                <View style={styles.transactionContent}>
                  <View style={styles.transactionIcon}>
                    <ArrowDownRight size={20} color={theme.colors.success[600]} />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>
                      {saving.description}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <Calendar size={12} color={theme.colors.gray[500]} />
                      <Text style={styles.transactionDate}>
                        {formatDate(saving.date, 'dd MMM yyyy')}
                      </Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Confirmado</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.transactionAmount}>
                    +{formatCurrency(saving.amount)}
                  </Text>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal para agregar aporte */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Nuevo Aporte</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="Monto del Aporte"
                placeholder="Ej: 500000"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="numeric"
                error={formErrors.amount}
                leftIcon={<DollarSign size={20} color={theme.colors.gray[400]} />}
              />

              <Input
                label="Descripción"
                placeholder="Ej: Aporte mensual octubre"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                error={formErrors.description}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => setShowAddModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Guardar"
                  onPress={handleSave}
                  loading={isSaving}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Los estilos se mantienen igual...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.gray[50] },
  header: { paddingTop: 60, paddingHorizontal: theme.spacing.lg, paddingBottom: 120, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: theme.fontSize['2xl'], fontWeight: theme.fontWeight.bold, color: theme.colors.white, marginBottom: theme.spacing.xl },
  balanceCard: { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  balanceLabel: { fontSize: theme.fontSize.sm, color: theme.colors.white, opacity: 0.9, marginBottom: theme.spacing.sm },
  balanceAmount: { fontSize: 36, fontWeight: theme.fontWeight.bold, color: theme.colors.white, marginBottom: theme.spacing.md },
  balanceFooter: { flexDirection: 'row', alignItems: 'center' },
  balanceItem: { flex: 1 },
  balanceItemLabel: { fontSize: theme.fontSize.xs, color: theme.colors.white, opacity: 0.8, marginBottom: 4 },
  balanceItemValue: { fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.semibold, color: theme.colors.white },
  balanceDivider: { width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.3)', marginHorizontal: theme.spacing.md },
  growthContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statsContainer: { flexDirection: 'row', gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, marginTop: -70 },
  statCard: { flex: 1, padding: theme.spacing.md, alignItems: 'center' },
  statIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.success[100], justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm },
  statValue: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.gray[900], marginBottom: 4 },
  statLabel: { fontSize: theme.fontSize.xs, color: theme.colors.gray[600], textAlign: 'center' },
  content: { padding: theme.spacing.lg },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.gray[200] },
  searchInput: { flex: 1, fontSize: theme.fontSize.base, color: theme.colors.gray[900], paddingVertical: theme.spacing.md, marginLeft: theme.spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.gray[900] },
  transactionCount: { fontSize: theme.fontSize.sm, color: theme.colors.gray[600] },
  transactionCard: { marginBottom: theme.spacing.sm },
  transactionContent: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  transactionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.success[100], justifyContent: 'center', alignItems: 'center' },
  transactionDetails: { flex: 1 },
  transactionDescription: { fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.medium, color: theme.colors.gray[900], marginBottom: 4 },
  transactionMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  transactionDate: { fontSize: theme.fontSize.xs, color: theme.colors.gray[500] },
  statusBadge: { backgroundColor: theme.colors.success[100], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  statusText: { fontSize: theme.fontSize.xs, color: theme.colors.success[700], fontWeight: theme.fontWeight.medium },
  transactionAmount: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.success[600] },
  emptyState: { padding: theme.spacing.xl, alignItems: 'center' },
  emptyStateText: { fontSize: theme.fontSize.base, color: theme.colors.gray[500], textAlign: 'center' },
  bottomSpacing: { height: 100 },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.gray[200] },
  modalTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.gray[900] },
  modalBody: { padding: theme.spacing.lg },
  modalActions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.lg },
  modalButton: { flex: 1 },
});