import axios from 'axios';
import {
    API_ENDPOINTS,
    FileMetadata,
    InitiateUploadResponse,
    UploadChunk,
} from '../types/api';
import { deviceIdUtil } from '../utils/deviceId';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000,
});

// Add request interceptor to include deviceId in headers
api.interceptors.request.use(async (config) => {
    const deviceId = await deviceIdUtil.getDeviceId();
    config.headers['X-Device-ID'] = deviceId;
    return config;
});

export const uploadService = {
    initiateUpload: async (file: File): Promise<InitiateUploadResponse> => {
        const deviceId = await deviceIdUtil.getDeviceId();
        const response = await api.post(API_ENDPOINTS.UPLOAD.INITIATE, {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            deviceId,
        });
        return response.data;
    },

    uploadChunk: async (chunk: UploadChunk): Promise<void> => {
        const deviceId = await deviceIdUtil.getDeviceId();
        const formData = new FormData();
        formData.append('fileId', chunk.fileId);
        formData.append('chunkIndex', chunk.chunkIndex.toString());
        formData.append('totalChunks', chunk.totalChunks.toString());
        formData.append('deviceId', deviceId);
        formData.append(
            'mimeType',
            chunk.mimeType || 'application/octet-stream'
        );

        if (chunk.isBase64) {
            // For base64 data, send it directly
            formData.append('chunk', chunk.data as string);
            formData.append('isBase64', 'true');
        } else {
            // Create a File object from the Blob with the original MIME type
            const file = new File([chunk.data], `chunk-${chunk.chunkIndex}`, {
                type: chunk.mimeType || 'application/octet-stream',
            });
            formData.append('chunk', file);
        }

        await api.post(API_ENDPOINTS.UPLOAD.CHUNK, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    finalizeUpload: async (
        fileId: string,
        fileName: string
    ): Promise<FileMetadata> => {
        const deviceId = await deviceIdUtil.getDeviceId();
        const response = await api.post(API_ENDPOINTS.UPLOAD.FINALIZE, {
            fileId,
            fileName,
            deviceId,
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
        const deviceId = await deviceIdUtil.getDeviceId();
        await api.post(API_ENDPOINTS.UPLOAD.CANCEL, { fileId, deviceId });
    },

    listFiles: async (): Promise<FileMetadata[]> => {
        const deviceId = await deviceIdUtil.getDeviceId();
        const response = await api.get(
            `${API_ENDPOINTS.FILES.LIST}/device/${deviceId}`
        );
        return response.data;
    },

    deleteFile: async (fileId: string): Promise<void> => {
        const deviceId = await deviceIdUtil.getDeviceId();
        await api.delete(API_ENDPOINTS.FILES.DELETE.replace(':id', fileId), {
            data: { deviceId },
        });
    },
};
