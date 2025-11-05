export type LoanStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'activo' | 'pagado';
export type UserRole = 'asociado' | 'cliente' | 'administrador';

export const APP_NAME = 'FAP Móvil';
export const APP_TAGLINE = 'Fondo en tu Bolsillo';

export const DEFAULT_INTEREST_RATE_ASSOCIATE = 2.0; // 2% anual
export const DEFAULT_INTEREST_RATE_CLIENT = 2.5; // 2.5% anual
export const DEFAULT_MIN_MONTHLY_CONTRIBUTION = 50000; // $50,000 COP

export const PASSWORD_MIN_LENGTH = 8;
export const MIN_AGE = 18;

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm';

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  activo: 'Activo',
  pagado: 'Pagado',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  asociado: 'Asociado',
  cliente: 'Cliente',
  administrador: 'Administrador',
};