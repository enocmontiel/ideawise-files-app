import { api } from './api';
import { FileMetadata, UploadProgress, API_ENDPOINTS } from '../types/api';
import { useNotificationStore } from '../store/notificationStore';
import { AxiosProgressEvent } from 'axios';
import { deviceIdUtil } from '../utils/deviceId';

const MAX_FILE_SIZE_MB = 100;

export const fileService = {
    async uploadFile(
        file: File | Blob,
        fileId: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<FileMetadata | null> {
        try {
            // Check file size before attempting upload
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > MAX_FILE_SIZE_MB) {
                useNotificationStore.getState().addNotification({
                    type: 'error',
                    title: 'File Too Large',
                    message: `File size (${fileSizeMB.toFixed(
                        1
                    )}MB) exceeds the ${MAX_FILE_SIZE_MB}MB limit`,
                });
                return null;
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post<FileMetadata>(
                API_ENDPOINTS.UPLOAD.INITIATE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        if (onProgress && progressEvent.total) {
                            onProgress({
                                status: 'uploading',
                                progress:
                                    progressEvent.loaded / progressEvent.total,
                                fileId,
                            });
                        }
                    },
                }
            );

            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'Upload Complete',
                message: `${response.data.name} has been uploaded successfully`,
            });

            return response.data;
        } catch (error: any) {
            let errorMessage = 'Unknown error occurred';
            let errorTitle = 'Upload Failed';

            if (error.response?.data?.error) {
                // Handle specific API error messages
                errorMessage = error.response.data.error;
                if (errorMessage.includes('File size exceeds limit')) {
                    errorTitle = 'File Too Large';
                    errorMessage = `File size exceeds the ${MAX_FILE_SIZE_MB}MB limit`;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            useNotificationStore.getState().addNotification({
                type: 'error',
                title: errorTitle,
                message: errorMessage,
            });

            return null;
        }
    },

    async listFiles(): Promise<FileMetadata[]> {
        try {
            const deviceId = await deviceIdUtil.getDeviceId();
            const response = await api.get<FileMetadata[]>(
                API_ENDPOINTS.FILES.LIST.replace(':deviceId', deviceId)
            );
            return response.data;
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';

            useNotificationStore.getState().addNotification({
                type: 'error',
                title: 'Error Loading Files',
                message: `Failed to load files: ${errorMessage}`,
            });

            throw error;
        }
    },

    async deleteFile(fileId: string): Promise<void> {
        try {
            await api.delete(API_ENDPOINTS.FILES.DELETE.replace(':id', fileId));

            useNotificationStore.getState().addNotification({
                type: 'success',
                title: 'File Deleted',
                message: 'File has been deleted successfully',
            });
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';

            useNotificationStore.getState().addNotification({
                type: 'error',
                title: 'Delete Failed',
                message: `Failed to delete file: ${errorMessage}`,
            });

            throw error;
        }
    },

    getFileUrl(path: string): string {
        return `${api.defaults.baseURL}${path}`;
    },
};
