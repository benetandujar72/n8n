export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface FilterParams {
  search?: string;
  status?: string;
  centreId?: string;
  cursId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId?: string;
  centreId?: string;
  cursId?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  table: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  specificData?: any;
  createdAt: string;
}

export interface SystemStatus {
  n8nStatus: 'online' | 'offline' | 'error';
  databaseStatus: 'online' | 'offline' | 'error';
  lastBackup: string;
  activeWorkflows: number;
  pendingEvaluations: number;
  totalUsers: number;
  totalCentres: number;
  totalCursos: number;
}

export interface DashboardStats {
  totalEvaluations: number;
  evaluationsToday: number;
  evaluationsThisWeek: number;
  evaluationsThisMonth: number;
  averageScore: number;
  activeWorkflows: number;
  pendingNotifications: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}
