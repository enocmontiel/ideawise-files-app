import { API_URL } from '../constants/Config';
import { FileMetadata, InitiateUploadResponse } from '../types/api';
import { deviceIdUtil } from '../utils/deviceId';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export const fileService = {
    deleteFile: async (fileId: string): Promise<void> => {
        const deviceId = await deviceIdUtil.getDeviceId();
        const response = await fetch(`${API_URL}/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Device-ID': deviceId,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete file');
        }
    },

    listFiles: async (): Promise<FileMetadata[]> => {
        const deviceId = await deviceIdUtil.getDeviceId();
        const response = await fetch(`${API_URL}/files/device/${deviceId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Device-ID': deviceId,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch files');
        }

        return response.json();
    },

    uploadFile: async (file: File): Promise<FileMetadata> => {
        try {
            const deviceId = await deviceIdUtil.getDeviceId();
            console.log('Using deviceId:', deviceId); // Debug log

            // Step 1: Initiate upload
            const initiateResponse = await fetch(`${API_URL}/upload/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-ID': deviceId,
                },
                body: JSON.stringify({
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    deviceId, // Include deviceId in body
                }),
            });

            if (!initiateResponse.ok) {
                const error = await initiateResponse.json();
                throw new Error(error.error || 'Failed to initiate upload');
            }

            const initData =
                (await initiateResponse.json()) as InitiateUploadResponse;
            console.log('Upload initiated:', initData); // Debug log

            // Step 2: Upload chunks
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            for (let i = 0; i < totalChunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append('chunk', chunk);
                formData.append('fileId', initData.fileId);
                formData.append('chunkIndex', i.toString());
                formData.append('totalChunks', totalChunks.toString());
                formData.append('deviceId', deviceId); // Include deviceId in form data

                const chunkResponse = await fetch(`${API_URL}/upload/chunk`, {
                    method: 'POST',
                    headers: {
                        'X-Device-ID': deviceId,
                    },
                    body: formData,
                });

                if (!chunkResponse.ok) {
                    throw new Error(`Failed to upload chunk ${i}`);
                }

                console.log(`Chunk ${i + 1}/${totalChunks} uploaded`); // Debug log
            }

            // Step 3: Finalize upload
            const finalizeResponse = await fetch(`${API_URL}/upload/finalize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-ID': deviceId,
                },
                body: JSON.stringify({
                    fileId: initData.fileId,
                    fileName: file.name,
                    deviceId, // Include deviceId in body
                }),
            });

            if (!finalizeResponse.ok) {
                throw new Error('Failed to finalize upload');
            }

            const result = await finalizeResponse.json();
            console.log('Upload finalized:', result); // Debug log
            return result;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },
};
