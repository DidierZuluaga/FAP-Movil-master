export type UserRole = 'asociado' | 'cliente' | 'administrador';

export type LoanStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'activo' | 'pagado';

export type PaymentStatus = 'pendiente' | 'confirmado' | 'rechazado';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Saving {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  description: string;
  receiptURL?: string;
  signatureURL?: string;
  accumulatedBalance: number;
  status: PaymentStatus;
  createdAt: Date;
  synced: boolean;
}

export interface Loan {
  id: string;
  userId: string;
  codeudorId?: string;
  amount: number;
  term: number; // meses
  interestRate: number;
  monthlyPayment: number;
  balance: number;
  status: LoanStatus;
  description: string;
  documentsURL?: string[];
  requestDate: Date;
  approvalDate?: Date;
  codeudorStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  date: Date;
  newBalance: number;
  receiptURL?: string;
  status: PaymentStatus;
  createdAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  mandatory: boolean;
  agenda?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Attendance {
  id: string;
  meetingId: string;
  userId: string;
  arrivalTime: Date;
  latitude?: number;
  longitude?: number;
  present: boolean;
  createdAt: Date;
}

export interface AppConfig {
  id: string;
  minMonthlyContribution: number;
  interestRateAssociate: number; // 2%
  interestRateClient: number; // 2.5%
  savingsInterestRate: number;
  annualFee: number;
  lastUpdated: Date;
  updatedBy: string;
}