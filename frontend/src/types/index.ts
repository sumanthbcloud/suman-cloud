export type FileCategory = 'photos' | 'videos' | 'audio' | 'documents' | 'all';

export interface CloudFile {
  id: string;
  name: string;
  category: 'photos' | 'videos' | 'audio' | 'documents';
  mimeType: string;
  size: number; // in bytes
  updatedAt: string;
  starred?: boolean;
  duration?: string;
  dimensions?: string;
}

export interface StorageCategoryBreakdown {
  category: 'photos' | 'videos' | 'audio' | 'documents';
  label: string;
  bytes: number;
  count: number;
  color: string;
}

export interface StorageOverviewData {
  usedBytes: number;
  totalBytes: number;
  categories: StorageCategoryBreakdown[];
}

export interface HealthResponse {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface BackendFileRecord {
  id: number;
  userId: number;
  filename: string;
  category: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  mimeType: string;
  size: number;
  objectKey: string;
  createdAt: string;
}

export interface AuthResponse {
  token?: string;
  message?: string;
}
