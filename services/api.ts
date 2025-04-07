import axios from 'axios';
import {
    API_ENDPOINTS,
    FileMetadata,
    InitiateUploadResponse,
    UploadChunk,
} from '../types/api';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000,
});

export const uploadService = {
    initiateUpload: async (file: File): Promise<InitiateUploadResponse> => {
        const response = await api.post(API_ENDPOINTS.UPLOAD.INITIATE, {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
        });
        return response.data;
    },

    uploadChunk: async (chunk: UploadChunk): Promise<void> => {
        const formData = new FormData();
        formData.append('fileId', chunk.fileId);
        formData.append('chunkIndex', chunk.chunkIndex.toString());
        formData.append('totalChunks', chunk.totalChunks.toString());
        formData.append('chunk', chunk.data);

        await api.post(API_ENDPOINTS.UPLOAD.CHUNK, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    finalizeUpload: async (fileId: string): Promise<FileMetadata> => {
        const response = await api.post(API_ENDPOINTS.UPLOAD.FINALIZE, {
            fileId,
        });
        return response.data;
    },

    getUploadStatus: async (
        fileId: string
    ): Promise<{ status: string; progress: number }> => {
        const response = await api.get(
            `${API_ENDPOINTS.UPLOAD.STATUS}/${fileId}`
        );
        return response.data;
    },

    cancelUpload: async (fileId: string): Promise<void> => {
        await api.post(API_ENDPOINTS.UPLOAD.CANCEL, { fileId });
    },

    listFiles: async (): Promise<FileMetadata[]> => {
        const response = await api.get(API_ENDPOINTS.FILES.LIST);
        return response.data;
    },

    deleteFile: async (fileId: string): Promise<void> => {
        await api.delete(API_ENDPOINTS.FILES.DELETE.replace(':id', fileId));
    },
};
