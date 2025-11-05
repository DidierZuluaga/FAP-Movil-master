import { Platform } from 'react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert as RNAlert,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Mail,
  Calendar,
  Shield,
  LogOut,
  ChevronRight,
  Camera,
  Bell,
  Lock,
  HelpCircle,
  FileText,
  X,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { theme } from '../../config/theme';
import { formatDate } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';
import { profileService } from '../../services/firestore/profileService';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateProfile } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Formulario de edición
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    dateOfBirth: user?.dateOfBirth ? formatDate(user.dateOfBirth, 'yyyy-MM-dd') : '',
  });
  const [editErrors, setEditErrors] = useState<any>({});

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro que deseas salir?')) {
        performLogout();
      }
    } else {
      RNAlert.alert(
        'Cerrar Sesión',
        '¿Estás seguro que deseas salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: performLogout },
        ]
      );
    }
  };

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      if (Platform.OS === 'web') {
        alert('Error al cerrar sesión. Intenta de nuevo.');
      } else {
        RNAlert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Cambiar foto de perfil
  const handleChangePhoto = async (source: 'camera' | 'gallery') => {
    if (!user) return;

    try {
      setIsUploadingPhoto(true);
      setShowPhotoModal(false);

      const photoURL = await profileService.changeProfilePhoto(user.id, source);

      // Actualizar en el estado local
      await updateProfile({ photoURL });

      if (Platform.OS === 'web') {
        alert('✅ Foto actualizada exitosamente');
      } else {
        RNAlert.alert('Éxito', 'Foto actualizada exitosamente');
      }
    } catch (error: any) {
      console.error('Error cambiando foto:', error);
      if (Platform.OS === 'web') {
        alert('❌ ' + (error.message || 'Error al cambiar la foto'));
      } else {
        RNAlert.alert('Error', error.message || 'No se pudo cambiar la foto');
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Validar formulario de edición
  const validateEditForm = () => {
    const errors: any = {};

    if (!editForm.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!editForm.dateOfBirth) {
      errors.dateOfBirth = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(editForm.dateOfBirth);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        errors.dateOfBirth = 'Debes ser mayor de 18 años';
      }
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar cambios de perfil
  const handleSaveProfile = async () => {
    if (!validateEditForm() || !user) return;

    try {
      setIsSaving(true);

      await profileService.updateUserProfile(user.id, {
        name: editForm.name,
        dateOfBirth: new Date(editForm.dateOfBirth),
      });

      // Actualizar en el estado local
      await updateProfile({
        name: editForm.name,
        dateOfBirth: new Date(editForm.dateOfBirth),
      });

      if (Platform.OS === 'web') {
        alert('✅ Perfil actualizado exitosamente');
      } else {
        RNAlert.alert('Éxito', 'Perfil actualizado exitosamente');
      }

      setShowEditModal(false);
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      if (Platform.OS === 'web') {
        alert('❌ Error al actualizar el perfil');
      } else {
        RNAlert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Navegación a secciones
  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleSecurity = () => {
    if (Platform.OS === 'web') {
      alert('🔒 Configuración de Seguridad\n\nPróximamente podrás:\n• Cambiar contraseña\n• Configurar autenticación de dos factores\n• Gestionar sesiones activas\n• Ver historial de accesos');
    } else {
      RNAlert.alert(
        '🔒 Configuración de Seguridad',
        'Próximamente podrás:\n\n• Cambiar contraseña\n• Configurar autenticación de dos factores\n• Gestionar sesiones activas\n• Ver historial de accesos'
      );
    }
  };

  const handleHelp = () => {
    if (Platform.OS === 'web') {
      alert('❓ Ayuda y Soporte\n\nPróximamente tendrás acceso a:\n• Preguntas frecuentes (FAQ)\n• Chat de soporte en vivo\n• Tutoriales en video\n• Centro de ayuda completo\n\nPor ahora, contacta al administrador para asistencia.');
    } else {
      RNAlert.alert(
        '❓ Ayuda y Soporte',
        'Próximamente tendrás acceso a:\n\n• Preguntas frecuentes (FAQ)\n• Chat de soporte en vivo\n• Tutoriales en video\n• Centro de ayuda completo\n\nPor ahora, contacta al administrador para asistencia.'
      );
    }
  };

  const handleTerms = () => {
    if (Platform.OS === 'web') {
      alert('📄 Términos y Condiciones\n\nAl usar FAP Móvil aceptas:\n\n• Proporcionar información verídica\n• Cumplir con los reglamentos del fondo\n• Mantener la confidencialidad de tu cuenta\n• Realizar transacciones de buena fe\n\nPara ver los términos completos, contacta al administrador.');
    } else {
      RNAlert.alert(
        '📄 Términos y Condiciones',
        'Al usar FAP Móvil aceptas:\n\n• Proporcionar información verídica\n• Cumplir con los reglamentos del fondo\n• Mantener la confidencialidad de tu cuenta\n• Realizar transacciones de buena fe\n\nPara ver los términos completos, contacta al administrador.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con gradiente */}
        <LinearGradient
          colors={[theme.colors.primary[600], theme.colors.secondary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Mi Perfil</Text>

          {/* Foto de perfil */}
          <View style={styles.profilePhotoContainer}>
            <View style={styles.profilePhoto}>
              {isUploadingPhoto ? (
                <ActivityIndicator size="large" color={theme.colors.primary[600]} />
              ) : user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.photoImage} />
              ) : (
                <User size={60} color={theme.colors.primary[600]} />
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowPhotoModal(true)}
              disabled={isUploadingPhoto}
            >
              <Camera size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </LinearGradient>

        {/* Información del usuario */}
        <View style={styles.content}>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Mail size={20} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
                <Text style={styles.infoValue}>
                  {user?.dateOfBirth
                    ? formatDate(user.dateOfBirth, 'dd/MM/yyyy')
                    : 'No especificada'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Shield size={20} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Rol</Text>
                <Text style={styles.infoValue}>
                  {user?.role ? ROLE_LABELS[user.role] : 'No especificado'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color={theme.colors.primary[600]} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Miembro desde</Text>
                <Text style={styles.infoValue}>
                  {user?.createdAt
                    ? formatDate(user.createdAt, 'MMMM yyyy')
                    : 'No disponible'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Botón editar perfil */}
          <Button
            title="Editar Perfil"
            onPress={() => setShowEditModal(true)}
            variant="outline"
            fullWidth
            style={styles.editButton}
          />

          {/* Opciones */}
          <Text style={styles.sectionTitle}>Configuración</Text>

          <Card style={styles.optionsCard}>
            <TouchableOpacity style={styles.option} onPress={handleNotifications}>
              <View style={styles.optionLeft}>
                <Bell size={20} color={theme.colors.gray[600]} />
                <Text style={styles.optionText}>Notificaciones</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.option} onPress={handleSecurity}>
              <View style={styles.optionLeft}>
                <Lock size={20} color={theme.colors.gray[600]} />
                <Text style={styles.optionText}>Seguridad y Privacidad</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.option} onPress={handleHelp}>
              <View style={styles.optionLeft}>
                <HelpCircle size={20} color={theme.colors.gray[600]} />
                <Text style={styles.optionText}>Ayuda y Soporte</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.option} onPress={handleTerms}>
              <View style={styles.optionLeft}>
                <FileText size={20} color={theme.colors.gray[600]} />
                <Text style={styles.optionText}>Términos y Condiciones</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          </Card>

          {/* Botón cerrar sesión */}
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="danger"
            fullWidth
            loading={isLoggingOut}
            icon={<LogOut size={20} color={theme.colors.white} />}
            style={styles.logoutButton}
          />

          {/* Versión */}
          <Text style={styles.version}>Versión 1.2.0</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal: Seleccionar fuente de foto */}
      <Modal
        visible={showPhotoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.photoModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Foto de Perfil</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.photoOptions}>
              <TouchableOpacity
                style={styles.photoOption}
                onPress={() => handleChangePhoto('camera')}
              >
                <View style={styles.photoOptionIcon}>
                  <Camera size={32} color={theme.colors.primary[600]} />
                </View>
                <Text style={styles.photoOptionText}>Tomar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoOption}
                onPress={() => handleChangePhoto('gallery')}
              >
                <View style={styles.photoOptionIcon}>
                  <ImageIcon size={32} color={theme.colors.primary[600]} />
                </View>
                <Text style={styles.photoOptionText}>Elegir de Galería</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Editar Perfil */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={theme.colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Input
                label="Nombre Completo"
                placeholder="Ej: Juan Pérez"
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                error={editErrors.name}
                leftIcon={<User size={20} color={theme.colors.gray[400]} />}
              />

              <Input
                label="Fecha de Nacimiento"
                placeholder="YYYY-MM-DD"
                value={editForm.dateOfBirth}
                onChangeText={(text) => setEditForm({ ...editForm, dateOfBirth: text })}
                error={editErrors.dateOfBirth}
                leftIcon={<Calendar size={20} color={theme.colors.gray[400]} />}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  onPress={() => setShowEditModal(false)}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="Guardar"
                  onPress={handleSaveProfile}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.gray[50] },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: theme.spacing.lg, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: theme.fontSize['2xl'], fontWeight: theme.fontWeight.bold, color: theme.colors.white, marginBottom: theme.spacing.xl },
  profilePhotoContainer: { position: 'relative', marginBottom: theme.spacing.md },
  profilePhoto: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.3)', overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary[600], justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.colors.white },
  userName: { fontSize: theme.fontSize['2xl'], fontWeight: theme.fontWeight.bold, color: theme.colors.white, marginBottom: theme.spacing.xs },
  userEmail: { fontSize: theme.fontSize.base, color: theme.colors.white, opacity: 0.9 },
  content: { padding: theme.spacing.lg },
  infoCard: { padding: theme.spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  infoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary[50], justifyContent: 'center', alignItems: 'center' },
  infoText: { flex: 1 },
  infoLabel: { fontSize: theme.fontSize.xs, color: theme.colors.gray[600], marginBottom: 2 },
  infoValue: { fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.medium, color: theme.colors.gray[900] },
  divider: { height: 1, backgroundColor: theme.colors.gray[200], marginVertical: theme.spacing.md },
  editButton: { marginTop: theme.spacing.lg },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold, color: theme.colors.gray[900], marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  optionsCard: { padding: 0 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  optionText: { fontSize: theme.fontSize.base, color: theme.colors.gray[900], fontWeight: theme.fontWeight.medium },
  logoutButton: { marginTop: theme.spacing.xl },
  version: { textAlign: 'center', fontSize: theme.fontSize.sm, color: theme.colors.gray[500], marginTop: theme.spacing.lg },
  bottomSpacing: { height: 40 },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '80%' },
  photoModalContent: { backgroundColor: theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.gray[200] },
  modalTitle: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold, color: theme.colors.gray[900] },
  modalBody: { padding: theme.spacing.lg },
  modalActions: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.lg },
  modalButton: { flex: 1 },
  photoOptions: { flexDirection: 'row', padding: theme.spacing.lg, gap: theme.spacing.md },
  photoOption: { flex: 1, alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.gray[50], borderRadius: theme.borderRadius.xl, borderWidth: 2, borderColor: theme.colors.gray[200] },
  photoOptionIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primary[50], justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  photoOptionText: { fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.semibold, color: theme.colors.gray[900] },
});