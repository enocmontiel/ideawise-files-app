import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useUploadStore } from '../store/uploadStore';
import Animated, {
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';

interface FilePreviewProps {
    id: string;
    name: string;
    size: number;
    type: string;
    uri: string;
    thumbnail?: string;
    colorScheme: 'light' | 'dark';
    onRemove: (id: string) => void;
    formatFileSize: (bytes: number) => string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
    id,
    name,
    size,
    type,
    uri,
    thumbnail,
    colorScheme,
    onRemove,
    formatFileSize,
}) => {
    const { activeUploads } = useUploadStore();
    const uploadProgress = activeUploads[id];
    const isUploading = uploadProgress?.status === 'uploading';
    const isComplete = uploadProgress?.progress === 1;
    const hasError = uploadProgress?.error;

    const progressStyle = useAnimatedStyle(() => ({
        width: withSpring(`${(uploadProgress?.progress || 0) * 100}%`, {
            damping: 20,
            stiffness: 90,
        }),
    }));

    const getStatusIcon = () => {
        if (isComplete) {
            return (
                <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color="#4CAF50"
                    style={styles.statusIcon}
                />
            );
        }
        if (hasError) {
            return (
                <MaterialCommunityIcons
                    name="alert-circle"
                    size={24}
                    color="#FF3B30"
                    style={styles.statusIcon}
                />
            );
        }
        if (isUploading) {
            return (
                <ActivityIndicator
                    size="small"
                    color={Colors[colorScheme].tint}
                    style={styles.statusIcon}
                />
            );
        }
        return null;
    };

    return (
        <View
            style={[
                styles.filePreview,
                { backgroundColor: Colors[colorScheme].background },
                isUploading && styles.uploadingFile,
            ]}
        >
            <View style={styles.fileInfo}>
                {thumbnail ? (
                    <Image
                        source={{ uri: thumbnail }}
                        style={styles.thumbnail}
                    />
                ) : (
                    <View
                        style={[styles.thumbnail, styles.thumbnailPlaceholder]}
                    >
                        <MaterialCommunityIcons
                            name={type.startsWith('video/') ? 'video' : 'file'}
                            size={24}
                            color={Colors[colorScheme].tint}
                        />
                    </View>
                )}
                <View style={styles.fileDetails}>
                    <Text
                        style={[
                            styles.fileName,
                            { color: Colors[colorScheme].text },
                        ]}
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                    <Text
                        style={[
                            styles.fileSize,
                            { color: Colors[colorScheme].text },
                        ]}
                    >
                        {formatFileSize(size)}
                        {uploadProgress && (
                            <Text style={styles.progressText}>
                                {' • '}
                                {Math.round(uploadProgress.progress * 100)}%
                            </Text>
                        )}
                    </Text>
                    {(isUploading || hasError) && (
                        <View style={styles.progressContainer}>
                            <Animated.View
                                style={[
                                    styles.progressBar,
                                    progressStyle,
                                    hasError && styles.progressBarError,
                                ]}
                            />
                        </View>
                    )}
                    {hasError && (
                        <Text style={styles.errorText} numberOfLines={1}>
                            {uploadProgress.error}
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.rightContainer}>
                {getStatusIcon()}
                {!isUploading && (
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => onRemove(id)}
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={20}
                            color={Colors[colorScheme].text}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    uploadingFile: {
        borderColor: Colors.light.tint,
        backgroundColor: '#F5F5F5',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    thumbnail: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
    },
    thumbnailPlaceholder: {
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 14,
        opacity: 0.7,
    },
    progressText: {
        color: Colors.light.tint,
        fontWeight: '500',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    removeButton: {
        padding: 8,
    },
    progressContainer: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.light.tint,
        borderRadius: 3,
    },
    progressBarError: {
        backgroundColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
    statusIcon: {
        marginRight: 4,
    },
});
