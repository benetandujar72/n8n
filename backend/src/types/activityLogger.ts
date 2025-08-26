export interface ActivityLogData {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';
  table: string;
  recordId?: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  timestamp?: Date;
}

export interface ActivityLog extends ActivityLogData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
