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

// Base64 decoding helper
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = decodeBase64(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Efficient base64 decoder
function decodeBase64(base64: string): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let bufferLength = base64.length * 0.75,
        len = base64.length,
        i,
        p = 0,
        encoded1,
        encoded2,
        encoded3,
        encoded4;

    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }

    const output = new Array(bufferLength);

    for (i = 0; i < len; i += 4) {
        encoded1 = chars.indexOf(base64[i]);
        encoded2 = chars.indexOf(base64[i + 1]);
        encoded3 = chars.indexOf(base64[i + 2]);
        encoded4 = chars.indexOf(base64[i + 3]);

        output[p++] = String.fromCharCode((encoded1 << 2) | (encoded2 >> 4));
        if (encoded3 !== -1) {
            output[p++] = String.fromCharCode(
                ((encoded2 & 15) << 4) | (encoded3 >> 2)
            );
        }
        if (encoded4 !== -1) {
            output[p++] = String.fromCharCode(((encoded3 & 3) << 6) | encoded4);
        }
    }

    return output.join('');
}

/**
 * Read file content in a platform-agnostic way
 */
export async function readFileContent(uri: string): Promise<ArrayBuffer> {
    if (Platform.OS === 'web') {
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
        return base64ToArrayBuffer(base64Content);
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
