import { fetchJson, uploadFileApi } from './api';
import type { BackendFileRecord, CloudFile, FileCategory } from '../types';

function formatTimeAgo(isoString: string): string {
  if (!isoString) return 'Recent';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Recent';
  }
}

export function mapBackendToCloudFile(record: BackendFileRecord): CloudFile {
  const catLower = record.category ? record.category.toLowerCase() : 'documents';
  let category: 'photos' | 'videos' | 'audio' | 'documents' = 'documents';
  if (catLower === 'photo' || catLower === 'photos') category = 'photos';
  else if (catLower === 'video' || catLower === 'videos') category = 'videos';
  else if (catLower === 'audio') category = 'audio';

  return {
    id: String(record.id),
    name: record.filename,
    category,
    mimeType: record.mimeType,
    size: record.size,
    updatedAt: formatTimeAgo(record.createdAt),
  };
}

export const fileService = {
  async listFiles(category?: FileCategory): Promise<CloudFile[]> {
    let query = '';
    if (category && category !== 'all') {
      const backendCategory = {
        photos: 'PHOTO',
        videos: 'VIDEO',
        audio: 'AUDIO',
        documents: 'DOCUMENT',
      }[category];
      if (backendCategory) {
        query = `?category=${backendCategory}`;
      }
    }

    const records = await fetchJson<BackendFileRecord[]>(`/api/files${query}`);
    return records.map(mapBackendToCloudFile);
  },

  async uploadFile(file: File): Promise<CloudFile> {
    const formData = new FormData();
    formData.append('file', file);
    const record = await uploadFileApi<BackendFileRecord>('/api/files', formData);
    return mapBackendToCloudFile(record);
  },

  async getPresignedUrl(id: string | number): Promise<string> {
    const res = await fetchJson<{ url: string }>(`/api/files/${id}/url`);
    return res.url;
  },

  async getDownloadUrl(id: string | number): Promise<string> {
    const res = await fetchJson<{ url: string }>(`/api/files/${id}/download-url`);
    return res.url;
  },

  async deleteFile(id: string | number): Promise<void> {
    await fetchJson<{ message: string }>(`/api/files/${id}`, {
      method: 'DELETE',
    });
  },
};
