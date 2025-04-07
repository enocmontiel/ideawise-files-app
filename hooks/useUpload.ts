import React, { useCallback, useState } from 'react';
import { Platform, ActionSheetIOS, Alert } from 'react-native';
import {
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useFileUpload } from './useFileUpload';
import { useUploadStore } from '../store/uploadStore';

interface WebFile extends File {
    uri?: string;
}

interface FilePreview {
    id: string;
    name: string;
    size: number;
    type: string;
    uri: string;
    thumbnail?: string;
}

type Asset = {
    uri: string;
    name?: string;
    mimeType?: string;
    size?: number;
};

export const useUpload = () => {
    const {
        isUploading,
        pickFiles,
        pickFromPhotos,
        pickFromCamera,
        uploadFile,
        cancelUpload,
    } = useFileUpload();
    const { activeUploads } = useUploadStore();
    const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Animation values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useCallback(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    }, [scale.value, opacity.value]);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        scale.value = withSpring(1.05);
        opacity.value = withTiming(0.8);
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: any) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDrop = useCallback(async (files: WebFile[]) => {
        const newFiles: FilePreview[] = files.map((file) => ({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            uri: URL.createObjectURL(file),
            thumbnail: file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : undefined,
        }));
        setSelectedFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleDropEvent = useCallback(
        (e: any) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files) as WebFile[];
            handleDrop(files);
        },
        [handleDrop]
    );

    const handleFilePick = useCallback(async () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [
                        'Cancel',
                        'Choose from Files',
                        'Choose from Photos',
                        'Take a Photo',
                    ],
                    cancelButtonIndex: 0,
                },
                async (buttonIndex) => {
                    if (buttonIndex === 1) {
                        const files = await pickFiles();
                        if (files && files.length > 0) {
                            const newFiles: FilePreview[] = files.map(
                                (file: Asset) => ({
                                    id: Math.random()
                                        .toString(36)
                                        .substring(2, 9),
                                    name: file.name || 'Unnamed file',
                                    size: file.size || 0,
                                    type:
                                        file.mimeType ||
                                        'application/octet-stream',
                                    uri: file.uri,
                                    thumbnail: file.mimeType?.startsWith(
                                        'image/'
                                    )
                                        ? file.uri
                                        : undefined,
                                })
                            );
                            setSelectedFiles((prev) => [...prev, ...newFiles]);
                        }
                    } else if (buttonIndex === 2) {
                        const files = await pickFromPhotos();
                        if (files && files.length > 0) {
                            const newFiles: FilePreview[] = files.map(
                                (file: Asset) => ({
                                    id: Math.random()
                                        .toString(36)
                                        .substring(2, 9),
                                    name: file.name || 'Photo from library',
                                    size: file.size || 0,
                                    type: file.mimeType || 'image/jpeg',
                                    uri: file.uri,
                                    thumbnail: file.uri,
                                })
                            );
                            setSelectedFiles((prev) => [...prev, ...newFiles]);
                        }
                    } else if (buttonIndex === 3) {
                        const files = await pickFromCamera();
                        if (files && files.length > 0) {
                            const newFiles: FilePreview[] = files.map(
                                (file: Asset) => ({
                                    id: Math.random()
                                        .toString(36)
                                        .substring(2, 9),
                                    name: file.name || 'Camera photo',
                                    size: file.size || 0,
                                    type: file.mimeType || 'image/jpeg',
                                    uri: file.uri,
                                    thumbnail: file.uri,
                                })
                            );
                            setSelectedFiles((prev) => [...prev, ...newFiles]);
                        }
                    }
                }
            );
        } else if (Platform.OS === 'android') {
            Alert.alert('Select Files', 'Choose where to select files from', [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Files',
                    onPress: async () => {
                        const files = await pickFiles();
                        if (files && files.length > 0) {
                            const newFiles: FilePreview[] = files.map(
                                (file: Asset) => ({
                                    id: Math.random()
                                        .toString(36)
                                        .substring(2, 9),
                                    name: file.name || 'Unnamed file',
                                    size: file.size || 0,
                                    type:
                                        file.mimeType ||
                                        'application/octet-stream',
                                    uri: file.uri,
                                    thumbnail: file.mimeType?.startsWith(
                                        'image/'
                                    )
                                        ? file.uri
                                        : undefined,
                                })
                            );
                            setSelectedFiles((prev) => [...prev, ...newFiles]);
                        }
                    },
                },
                {
                    text: 'Photos',
                    onPress: async () => {
                        const files = await pickFromPhotos();
                        if (files && files.length > 0) {
                            const newFiles: FilePreview[] = files.map(
                                (file: Asset) => ({
                                    id: Math.random()
                                        .toString(36)
                                        .substring(2, 9),
                                    name: file.name || 'Photo from library',
                                    size: file.size || 0,
                                    type: file.mimeType || 'image/jpeg',
                                    uri: file.uri,
                                    thumbnail: file.uri,
                                })
                            );
                            setSelectedFiles((prev) => [...prev, ...newFiles]);
                        }
                    },
                },
                {
                    text: 'Take Photo',
                    onPress: async () => {
                        const files = await pickFromCamera();
                        if (files && files.length > 0) {
                            const newFiles: FilePreview[] = files.map(
                                (file: Asset) => ({
                                    id: Math.random()
                                        .toString(36)
                                        .substring(2, 9),
                                    name: file.name || 'Camera photo',
                                    size: file.size || 0,
                                    type: file.mimeType || 'image/jpeg',
                                    uri: file.uri,
                                    thumbnail: file.uri,
                                })
                            );
                            setSelectedFiles((prev) => [...prev, ...newFiles]);
                        }
                    },
                },
            ]);
        } else {
            const files = await pickFiles();
            if (files && files.length > 0) {
                const newFiles: FilePreview[] = files.map((file: Asset) => ({
                    id: Math.random().toString(36).substring(2, 9),
                    name: file.name || 'Unnamed file',
                    size: file.size || 0,
                    type: file.mimeType || 'application/octet-stream',
                    uri: file.uri,
                    thumbnail: file.mimeType?.startsWith('image/')
                        ? file.uri
                        : undefined,
                }));
                setSelectedFiles((prev) => [...prev, ...newFiles]);
            }
        }
    }, [pickFiles, pickFromPhotos, pickFromCamera]);

    const handleUploadAll = useCallback(async () => {
        if (selectedFiles.length === 0) return;

        for (const file of selectedFiles) {
            await uploadFile({
                uri: file.uri,
                name: file.name,
                mimeType: file.type,
                size: file.size,
            });
        }

        setSelectedFiles([]);
    }, [selectedFiles, uploadFile]);

    const removeFile = useCallback((id: string) => {
        setSelectedFiles((prev) => prev.filter((file) => file.id !== id));
    }, []);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
        isUploading,
        activeUploads,
        selectedFiles,
        isDragging,
        scale,
        opacity,
        animatedStyle,
        handleDrop,
        handleFilePick,
        handleUploadAll,
        removeFile,
        formatFileSize,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDropEvent,
    };
};
