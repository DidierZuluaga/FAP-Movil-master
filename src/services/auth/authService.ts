import { supabase } from '../../config/supabase';
import { User } from '../../types';

class AuthService {
  // Registrar con email
  async registerWithEmail(
    email: string,
    password: string,
    name: string,
    dateOfBirth: Date,
    role: 'asociado' | 'cliente' = 'asociado'
  ): Promise<User> {
    try {
      console.log('📝 Iniciando registro:', { email, name, role });

      // Validar contraseña ANTES de enviar a Supabase
      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      // Validar edad (mayor de 18)
      const age = this.calculateAge(dateOfBirth);
      if (age < 18) {
        throw new Error('Debes ser mayor de 18 años para registrarte');
      }

      console.log('✅ Validaciones pasadas, creando usuario en Supabase Auth...');

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      console.log('✅ Usuario creado en Auth:', authData.user.id);

      // 2. Usar la función SQL para crear el perfil (bypasea RLS)
      const { data: userData, error: dbError } = await supabase.rpc(
        'create_user_profile',
        {
          p_user_id: authData.user.id,
          p_email: email,
          p_name: name,
          p_role: role,
          p_date_of_birth: dateOfBirth.toISOString(),
        }
      );

      if (dbError) {
        console.error('❌ Error al crear perfil:', dbError);
        throw new Error(`No se pudo crear el perfil: ${dbError.message}`);
      }

      console.log('✅ Usuario guardado en tabla users');

      const user: User = {
        id: authData.user.id,
        email,
        name,
        role,
        dateOfBirth,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('✅ Registro exitoso');
      return user;
    } catch (error: any) {
      console.error('❌ Error en registro:', error);

      let errorMessage = 'Error al registrar usuario';

      // Mensajes de error en español
      if (error.message?.includes('already registered')) {
        errorMessage = 'Este correo ya está registrado. Inicia sesión en su lugar.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'El correo electrónico no es válido.';
      } else if (error.message?.includes('weak password')) {
        errorMessage = 'La contraseña debe tener al menos 8 caracteres.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Iniciar sesión con email
  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Iniciando sesión:', email);

      if (password.length < 6) {
        throw new Error('La contraseña es incorrecta');
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo iniciar sesión');

      console.log('✅ Autenticación exitosa:', authData.user.id);

      // Obtener datos del usuario de la tabla users
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (dbError || !userData) {
        console.error('❌ Usuario no encontrado en la base de datos');
        throw new Error('Usuario no encontrado en la base de datos');
      }

      console.log('✅ Datos de usuario obtenidos');

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photo_url,
        role: userData.role,
        dateOfBirth: new Date(userData.date_of_birth),
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      };
    } catch (error: any) {
      console.error('❌ Error en login:', error);

      let errorMessage = 'Error al iniciar sesión';

      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Correo o contraseña incorrectos.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Debes confirmar tu correo antes de iniciar sesión.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      console.log('👋 Cerrando sesión...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('✅ Sesión cerrada');
    } catch (error: any) {
      console.error('❌ Error al cerrar sesión:', error);
      throw new Error('No se pudo cerrar sesión');
    }
  }

  // Listener de cambios de autenticación
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);

        if (session?.user) {
          try {
            console.log('👤 Usuario autenticado:', session.user.id);

            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error || !userData) {
              console.warn('⚠️ Usuario en Auth pero no en tabla users');
              callback(null);
              return;
            }

            callback({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              photoURL: userData.photo_url,
              role: userData.role,
              dateOfBirth: new Date(userData.date_of_birth),
              createdAt: new Date(userData.created_at),
              updatedAt: new Date(userData.updated_at),
            });
          } catch (error) {
            console.error('❌ Error obteniendo datos de usuario:', error);
            callback(null);
          }
        } else {
          console.log('👋 Usuario no autenticado');
          callback(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }

  // Enviar correo de restablecimiento de contraseña
  async sendPasswordReset(email: string): Promise<void> {
    try {
      console.log('📧 Enviando correo de restablecimiento a:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      console.log('✅ Correo enviado');
    } catch (error: any) {
      console.error('❌ Error enviando correo:', error);

      let errorMessage = 'Error al enviar correo de restablecimiento';

      if (error.message?.includes('User not found')) {
        errorMessage = 'No existe una cuenta con este correo.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  // Actualizar perfil de usuario
  async updateUserProfile(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>
  ): Promise<void> {
    try {
      console.log('✏️ Actualizando perfil:', userId);

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name) updateData.name = updates.name;
      if (updates.photoURL) updateData.photo_url = updates.photoURL;
      if (updates.role) updateData.role = updates.role;
      if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth.toISOString();

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      console.log('✅ Perfil actualizado');
    } catch (error: any) {
      console.error('❌ Error actualizando perfil:', error);
      throw new Error('No se pudo actualizar el perfil');
    }
  }

  // Calcular edad
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Iniciar sesión con Google
  async loginWithGoogle(): Promise<User> {
    throw new Error('Google sign-in debe implementarse en el cliente');
  }
}

export const authService = new AuthService();