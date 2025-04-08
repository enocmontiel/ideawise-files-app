import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface FileInfo {
    exists: boolean;
    size: number;
    uri: string;
}

type FileSystemResponse = {
    exists: boolean;
    size?: number;
    uri: string;
    isDirectory: boolean;
};

/**
 * Get file information in a platform-agnostic way
 */
export async function getFileInfo(uri: string): Promise<FileInfo> {
    if (Platform.OS === 'web') {
        // For web, we need to fetch the file to get its size
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            return {
                exists: true,
                size: blob.size,
                uri,
            };
        } catch (error) {
            console.error('Error getting file info on web:', error);
            return {
                exists: false,
                size: 0,
                uri,
            };
        }
    }

    try {
        const fileInfo = (await FileSystem.getInfoAsync(
            uri
        )) as FileSystemResponse;
        if (!fileInfo.exists) {
            return {
                exists: false,
                size: 0,
                uri,
            };
        }

        // For native platforms, we need to get the size separately
        const fileStats = (await FileSystem.getInfoAsync(uri, {
            size: true,
        })) as FileSystemResponse;
        return {
            exists: true,
            size: fileStats.size || 0,
            uri: fileInfo.uri,
        };
    } catch (error) {
        console.error('Error getting file info on native:', error);
        return {
            exists: false,
            size: 0,
            uri,
        };
    }
}

/**
 * Read file content in a platform-agnostic way
 */
export async function readFileContent(uri: string): Promise<ArrayBuffer> {
    if (Platform.OS === 'web') {
        // For web, fetch the file and convert to base64
        try {
            const response = await fetch(uri);
            return await response.arrayBuffer();
        } catch (error) {
            console.error('Error reading file content on web:', error);
            throw error;
        }
    }

    try {
        const base64Content = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (error) {
        console.error('Error reading file content on native:', error);
        throw error;
    }
}

export const getFileUrl = (path: string | undefined): string | undefined => {
    if (!path) return undefined;

    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    return path.startsWith('http') ? path : `${baseUrl}${path}`;
};
