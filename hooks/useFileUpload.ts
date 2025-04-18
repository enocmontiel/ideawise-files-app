import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { uploadService } from '../services/api';
import { useUploadStore } from '../store/uploadStore';
import { FileMetadata, UploadProgress } from '../types/api';
import { getFileInfo, readFileContent } from '../utils/fileUtils';
import { Platform } from 'react-native';

const CHUNK_SIZE = 1024 * 1024; // 1MB
const MAX_CONCURRENT_UPLOADS = 3;
const MAX_RETRIES = 3;

type Asset = {
    uri: string;
    name?: string;
    mimeType?: string;
    size?: number;
};

// Custom base64 encoding function to replace btoa
function encodeBase64(input: string): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';
    let i = 0;
    const len = input.length;

    while (i < len) {
        const chr1 = input.charCodeAt(i++);
        const chr2 = i < len ? input.charCodeAt(i++) : NaN;
        const chr3 = i < len ? input.charCodeAt(i++) : NaN;

        const enc1 = chr1 >> 2;
        const enc2 = ((chr1 & 3) << 4) | (isNaN(chr2) ? 0 : chr2 >> 4);
        const enc3 = isNaN(chr2)
            ? 64
            : ((chr2 & 15) << 2) | (isNaN(chr3) ? 0 : chr3 >> 6);
        const enc4 = isNaN(chr3) ? 64 : chr3 & 63;

        output +=
            chars.charAt(enc1) +
            chars.charAt(enc2) +
            chars.charAt(enc3) +
            chars.charAt(enc4);
    }

    return output;
}

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
                selectionLimit: 10,
                allowsMultipleSelection: true,
            });

            if (result.canceled) return [];

            // Process the assets to include file metadata
            const processedAssets = await Promise.all(
                result.assets.map(async (asset) => {
                    const fileInfo = await getFileInfo(asset.uri);
                    return {
                        uri: asset.uri,
                        name: asset.fileName || `photo-${Date.now()}.jpg`,
                        mimeType: asset.mimeType || 'image/jpeg',
                        size: fileInfo.size,
                    };
                })
            );

            return processedAssets;
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
                exif: true,
            });

            if (result.canceled) return [];

            // Process the assets to include file metadata
            const processedAssets = await Promise.all(
                result.assets.map(async (asset) => {
                    const fileInfo = await getFileInfo(asset.uri);
                    return {
                        uri: asset.uri,
                        name: `camera-photo-${Date.now()}.jpg`,
                        mimeType: asset.mimeType || 'image/jpeg',
                        size: fileInfo.size,
                    };
                })
            );

            return processedAssets;
        } catch (error) {
            console.error('Error picking from camera:', error);
            return [];
        }
    }, []);

    const uploadFile = useCallback(
        async (file: Asset) => {
            let fileId: string = '';
            try {
                setIsUploading(true);
                const fileInfo = await getFileInfo(file.uri);

                if (!fileInfo.exists) {
                    throw new Error('File does not exist');
                }

                // Initiate upload
                const {
                    fileId: tempFileId,
                    chunks,
                    chunkSize,
                } = await uploadService.initiateUpload({
                    name: file.name || 'unnamed',
                    size: fileInfo.size,
                    type: file.mimeType || 'application/octet-stream',
                } as File);

                // Create initial progress
                updateUploadProgress(tempFileId, {
                    fileId: tempFileId,
                    progress: 0,
                    status: 'pending',
                });

                // Read file in chunks
                const fileContent = await readFileContent(file.uri);

                const totalChunks = Math.ceil(
                    fileContent.byteLength / CHUNK_SIZE
                );
                let retryCount = 0;

                for (let i = 0; i < totalChunks; i++) {
                    const start = i * CHUNK_SIZE;
                    const end = Math.min(
                        (i + 1) * CHUNK_SIZE,
                        fileContent.byteLength
                    );
                    const chunk = fileContent.slice(start, end);

                    try {
                        console.log(
                            `Uploading chunk ${i + 1}/${totalChunks} for file ${
                                file.name
                            }`
                        );

                        const mimeType =
                            file.mimeType || 'application/octet-stream';

                        if (Platform.OS === 'web') {
                            // For web, create a Blob from the chunk
                            await uploadService.uploadChunk({
                                fileId: tempFileId,
                                chunkIndex: i,
                                totalChunks,
                                data: new Blob([chunk], { type: mimeType }),
                                size: chunk.byteLength,
                            });
                        } else {
                            // For mobile, convert ArrayBuffer to base64
                            const uint8Array = new Uint8Array(chunk);
                            let binary = '';
                            for (let i = 0; i < uint8Array.byteLength; i++) {
                                binary += String.fromCharCode(uint8Array[i]);
                            }
                            const base64Chunk = encodeBase64(binary);

                            await uploadService.uploadChunk({
                                fileId: tempFileId,
                                chunkIndex: i,
                                totalChunks,
                                data: base64Chunk,
                                size: chunk.byteLength,
                                isBase64: true,
                                mimeType:
                                    file.mimeType || 'application/octet-stream',
                            });
                        }

                        // Update progress (normalize to 0-1 range)
                        updateUploadProgress(tempFileId, {
                            fileId: tempFileId,
                            progress: (i + 1) / totalChunks,
                            status: 'uploading',
                        });

                        retryCount = 0; // Reset retry count on successful upload
                    } catch (error) {
                        console.error(
                            `Error uploading chunk ${i + 1}/${totalChunks}:`,
                            error
                        );

                        retryCount++;
                        if (retryCount >= MAX_RETRIES) {
                            updateUploadProgress(tempFileId, {
                                fileId: tempFileId,
                                progress: i / totalChunks,
                                status: 'error',
                                error: 'Failed to upload chunk after multiple retries',
                            });
                            throw error;
                        }

                        // Retry the same chunk
                        i--;
                        continue;
                    }
                }

                // Finalize upload
                const metadata = await uploadService.finalizeUpload(
                    tempFileId,
                    file.name || 'unnamed-file'
                );

                // Update progress to complete
                updateUploadProgress(tempFileId, {
                    fileId: tempFileId,
                    progress: 1,
                    status: 'completed',
                });

                // Add file to store
                addFile(metadata);

                fileId = tempFileId;
                return metadata;
            } catch (error: any) {
                console.error('Error uploading file:', error);
                if (fileId) {
                    updateUploadProgress(fileId, {
                        fileId,
                        progress: 0,
                        status: 'error',
                        error: error.message || 'Failed to upload file',
                    });
                }
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
        setIsUploading,
        pickFiles,
        pickFromPhotos,
        pickFromCamera,
        uploadFile,
        cancelUpload,
    };
};
