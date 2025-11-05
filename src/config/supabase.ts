// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';

// ⚠️ REEMPLAZA ESTOS VALORES CON TUS CREDENCIALES DE SUPABASE
const supabaseUrl = 'https://ugcxcnypfojegmeovfsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnY3hjbnlwZm9qZWdtZW92ZnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTQxNTUsImV4cCI6MjA3Nzg5MDE1NX0.tTyDgSlF31MWjcdF095Gb1EIkwVJ6JTVPtsYby6w8h8';

// Si prefieres usar variables de entorno, descomenta estas líneas:
// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: undefined, // Expo maneja el storage automáticamente
  }
});

// Tipos de la base de datos (basados en tus tipos existentes)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          photo_url?: string;
          role: 'asociado' | 'cliente' | 'administrador';
          date_of_birth: string;
          monthly_contribution: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      loans: {
        Row: {
          id: string;
          user_id: string;
          codeudor_id?: string;
          amount: number;
          balance: number;
          term: number;
          interest_rate: number;
          monthly_payment: number;
          status: 'pendiente' | 'aprobado' | 'rechazado' | 'activo' | 'pagado';
          description: string;
          documents_url?: string[];
          request_date: string;
          approval_date?: string;
          codeudor_status?: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['loans']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['loans']['Insert']>;
      };
      savings: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          date: string;
          description: string;
          receipt_url?: string;
          signature_url?: string;
          accumulated_balance: number;
          status: 'pendiente' | 'confirmado' | 'rechazado';
          created_at: string;
          synced: boolean;
        };
        Insert: Omit<Database['public']['Tables']['savings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['savings']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          loan_id: string;
          user_id: string;
          amount: number;
          date: string;
          new_balance: number;
          receipt_url?: string;
          status: 'pendiente' | 'confirmado' | 'rechazado';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'loan_approved' | 'loan_rejected' | 'payment_reminder' | 'meeting_reminder' | 'saving_confirmed' | 'general';
          title: string;
          message: string;
          read: boolean;
          action_url?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
}