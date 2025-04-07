import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { uploadService } from '../services/api';
import { useUploadStore } from '../store/uploadStore';
import { FileMetadata, UploadProgress } from '../types/api';
import { getFileInfo, readFileContent } from '../utils/fileUtils';

const CHUNK_SIZE = 1024 * 1024; // 1MB
const MAX_CONCURRENT_UPLOADS = 3;
const MAX_RETRIES = 3;

type Asset = {
    uri: string;
    name?: string;
    mimeType?: string;
    size?: number;
};

export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const { addFile, updateUploadProgress, removeFile } = useUploadStore();

    const pickFiles = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'video/*'],
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (result.canceled) return [];

            return result.assets;
        } catch (error) {
            console.error('Error picking files:', error);
            return [];
        }
    }, []);

    const pickFromPhotos = useCallback(async () => {
        try {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Media library permission not granted');
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                quality: 1,
                allowsEditing: true,
            });

            if (result.canceled) return [];

            return result.assets;
        } catch (error) {
            console.error('Error picking from photos:', error);
            return [];
        }
    }, []);

    const pickFromCamera = useCallback(async () => {
        try {
            const { status } =
                await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Camera permission not granted');
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                quality: 1,
                allowsEditing: true,
            });

            if (result.canceled) return [];

            return result.assets;
        } catch (error) {
            console.error('Error picking from camera:', error);
            return [];
        }
    }, []);

    const uploadFile = useCallback(
        async (file: Asset) => {
            try {
                setIsUploading(true);
                const fileInfo = await getFileInfo(file.uri);

                if (!fileInfo.exists) {
                    throw new Error('File does not exist');
                }

                // Initiate upload
                const { fileId, chunks, chunkSize } =
                    await uploadService.initiateUpload({
                        name: file.name || 'unnamed',
                        size: fileInfo.size,
                        type: file.mimeType || 'application/octet-stream',
                    } as File);

                // Create initial progress
                updateUploadProgress(fileId, {
                    fileId,
                    progress: 0,
                    status: 'pending',
                });

                // Read file in chunks
                const fileContent = await readFileContent(file.uri);

                const totalChunks = Math.ceil(fileContent.length / CHUNK_SIZE);
                let retryCount = 0;

                for (let i = 0; i < totalChunks; i++) {
                    const chunk = fileContent.slice(
                        i * CHUNK_SIZE,
                        (i + 1) * CHUNK_SIZE
                    );

                    try {
                        await uploadService.uploadChunk({
                            fileId,
                            chunkIndex: i,
                            totalChunks,
                            data: new Blob([chunk], { type: file.mimeType }),
                            size: chunk.length,
                        });

                        updateUploadProgress(fileId, {
                            fileId,
                            progress: ((i + 1) / totalChunks) * 100,
                            status: 'uploading',
                        });
                    } catch (error) {
                        if (retryCount < MAX_RETRIES) {
                            retryCount++;
                            i--; // Retry the same chunk
                            await new Promise((resolve) =>
                                setTimeout(
                                    resolve,
                                    Math.pow(2, retryCount) * 1000
                                )
                            );
                            continue;
                        }
                        throw error;
                    }
                }

                // Finalize upload
                const uploadedFile = await uploadService.finalizeUpload(fileId);
                addFile(uploadedFile);

                updateUploadProgress(fileId, {
                    fileId,
                    progress: 100,
                    status: 'completed',
                });

                return uploadedFile;
            } catch (error) {
                console.error('Error uploading file:', error);
                throw error;
            } finally {
                setIsUploading(false);
            }
        },
        [addFile, updateUploadProgress]
    );

    const cancelUpload = useCallback(
        async (fileId: string) => {
            try {
                await uploadService.cancelUpload(fileId);
                removeFile(fileId);
            } catch (error) {
                console.error('Error canceling upload:', error);
            }
        },
        [removeFile]
    );

    return {
        isUploading,
        pickFiles,
        pickFromPhotos,
        pickFromCamera,
        uploadFile,
        cancelUpload,
    };
};
