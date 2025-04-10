export interface FileMetadata {
    id: string;
    name: string;
    type: string;
    size: number;
    mimeType: string;
    createdAt: string;
    updatedAt: string;
    url: string;
    thumbnailUrl?: string;
}

export interface UploadChunk {
    fileId: string;
    chunkIndex: number;
    totalChunks: number;
    data: Blob | string;
    size: number;
    isBase64?: boolean;
    mimeType?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'error';

export interface UploadProgress {
    fileId: string;
    progress: number;
    status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
    error?: string;
}

export interface InitiateUploadResponse {
    fileId: string;
    uploadUrl: string;
    chunks: number;
    chunkSize: number;
}

export interface UploadState {
    files: FileMetadata[];
    activeUploads: Record<string, UploadProgress>;
    uploadHistory: FileMetadata[];
    syncStatus: SyncStatus;
    lastSyncTime?: string;
}

// API Endpoints
export const API_ENDPOINTS = {
    UPLOAD: {
        INITIATE: '/api/upload/initiate',
        CHUNK: '/api/upload/chunk',
        FINALIZE: '/api/upload/finalize',
        STATUS: '/api/upload/status',
        CANCEL: '/api/upload/cancel',
    },
    FILES: {
        LIST: '/files',
        LIST_BY_DEVICE: '/files/device/:deviceId',
        DELETE: '/files/:id',
        DETAILS: '/api/files/:id',
    },
} as const;
