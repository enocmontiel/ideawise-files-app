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
}

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
        LIST: '/api/files',
        DELETE: '/api/files/:id',
        DETAILS: '/api/files/:id',
    },
} as const;
