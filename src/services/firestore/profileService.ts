// src/services/firestore/profileService.ts
import { supabase } from '../../config/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

class ProfileService {
  // Tomar foto con la cámara - CORREGIDO PARA WEB
  async takePhoto(): Promise<string | null> {
    try {
      console.log('📸 Iniciando toma de foto...');

      if (Platform.OS === 'web') {
        return await this.takePhotoWeb();
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Se requieren permisos de cámara');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) {
        return null;
      }

      return `data:image/jpeg;base64,${result.assets[0].base64}`;
    } catch (error: any) {
      console.error('❌ Error tomando foto:', error);

      if (Platform.OS === 'web') {
        console.log('🔄 Fallback a selector de archivos para cámara');
        return await this.pickImageWeb();
      }

      throw new Error(`No se pudo tomar la foto: ${error.message}`);
    }
  }

  // Cámara para WEB usando getUserMedia
  private async takePhotoWeb(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('📱 Navegador no soporta cámara, usando selector de archivos');
        this.pickImageWeb().then(resolve);
        return;
      }

      const video = document.createElement('video');
      video.style.display = 'none';
      video.autoplay = true;

      const canvas = document.createElement('canvas');
      canvas.style.display = 'none';
      const ctx = canvas.getContext('2d');

      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center';

      const preview = document.createElement('video');
      preview.style.cssText = 'width:400px;height:400px;object-fit:cover;border-radius:10px';
      preview.autoplay = true;

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'margin-top:20px;display:flex;gap:10px';

      const captureButton = document.createElement('button');
      captureButton.textContent = '📸 Tomar Foto';
      captureButton.style.cssText = 'padding:10px 20px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer';

      const cancelButton = document.createElement('button');
      cancelButton.textContent = '❌ Cancelar';
      cancelButton.style.cssText = 'padding:10px 20px;background:#dc3545;color:white;border:none;border-radius:5px;cursor:pointer';

      let mediaStream: MediaStream | null = null;

      captureButton.onclick = () => {
        if (!ctx) return;
        canvas.width = preview.videoWidth;
        canvas.height = preview.videoHeight;
        ctx.drawImage(preview, 0, 0);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);

        if (mediaStream) {
          mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
        document.body.removeChild(modal);
        resolve(photoDataUrl);
      };

      cancelButton.onclick = () => {
        if (mediaStream) {
          mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
        document.body.removeChild(modal);
        resolve(null);
      };

      buttonContainer.appendChild(captureButton);
      buttonContainer.appendChild(cancelButton);
      modal.appendChild(preview);
      modal.appendChild(buttonContainer);
      document.body.appendChild(modal);

      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 800 }, height: { ideal: 800 } }
      })
      .then(stream => {
        mediaStream = stream;
        preview.srcObject = stream;
        video.srcObject = stream;
      })
      .catch(error => {
        console.error('Error accediendo a la cámara:', error);
        document.body.removeChild(modal);
        this.pickImageWeb().then(resolve);
      });
    });
  }

  // Seleccionar foto de galería
  async pickImage(): Promise<string | null> {
    try {
      console.log('🖼️ Iniciando selección de imagen...');

      if (Platform.OS === 'web') {
        return await this.pickImageWeb();
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Se requieren permisos de galería');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]?.base64) {
        return null;
      }

      return `data:image/jpeg;base64,${result.assets[0].base64}`;
    } catch (error: any) {
      console.error('❌ Error seleccionando imagen:', error);
      throw new Error(`No se pudo seleccionar la imagen: ${error.message}`);
    }
  }

  // Selector de archivos para web
  private async pickImageWeb(): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';

      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        try {
          const base64 = await this.fileToBase64(file);
          resolve(base64);
        } catch (error) {
          console.error('Error convirtiendo archivo:', error);
          resolve(null);
        }

        document.body.removeChild(input);
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  // Convertir archivo a Base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Cambiar foto de perfil
  async changeProfilePhoto(userId: string, source: 'camera' | 'gallery'): Promise<string> {
    try {
      console.log('📸 Cambiando foto de perfil con fuente:', source);

      const imageBase64 = source === 'camera'
        ? await this.takePhoto()
        : await this.pickImage();

      if (!imageBase64) {
        throw new Error('No se seleccionó ninguna imagen');
      }

      console.log('✅ Imagen obtenida correctamente');
      return imageBase64;
    } catch (error: any) {
      console.error('❌ Error cambiando foto de perfil:', error);

      console.log('🔄 Usando avatar como fallback');
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}_${Date.now()}&backgroundColor=2563eb`;
    }
  }

  // Actualizar perfil de usuario
  async updateUserProfile(userId: string, updates: any): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.photoURL !== undefined) updateData.photo_url = updates.photoURL;
      if (updates.monthlyContribution !== undefined) updateData.monthly_contribution = updates.monthlyContribution;

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      throw new Error('No se pudo actualizar el perfil');
    }
  }

  // Obtener perfil de usuario
  async getUserProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        email: data.email,
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' '),
        role: data.role,
        photoURL: data.photo_url,
        monthlyContribution: data.monthly_contribution || 0,
        birthDate: new Date(data.date_of_birth),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error: any) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  // Actualizar aporte mensual
  async updateMonthlyContribution(userId: string, amount: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ monthly_contribution: amount })
        .eq('id', userId);

      if (error) throw error;
      console.log('✅ Aporte mensual actualizado:', amount);
    } catch (error: any) {
      console.error('Error actualizando aporte mensual:', error);
      throw new Error('No se pudo actualizar el aporte mensual');
    }
  }

  // Obtener solo el aporte mensual
  async getMonthlyContribution(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('monthly_contribution')
        .eq('id', userId)
        .single();

      if (error || !data) return 0;
      return data.monthly_contribution || 0;
    } catch (error: any) {
      console.error('Error obteniendo aporte mensual:', error);
      return 0;
    }
  }
}

export const profileService = new ProfileService();