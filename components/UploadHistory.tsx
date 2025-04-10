import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useUploadStore } from '../store/uploadStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { getFileUrl } from '../utils/fileUtils';
import { FileFilter, FileFilterType } from './FileFilter';
import FilePreviewModal from './FilePreviewModal';
import { Image } from 'expo-image';

interface UploadHistoryProps {
    onDelete?: (fileId: string) => void;
}

export default function UploadHistory({ onDelete }: UploadHistoryProps) {
    const { uploadHistory, removeFile } = useUploadStore();
    const [filter, setFilter] = useState<FileFilterType>('all');
    const [previewFile, setPreviewFile] = useState<{
        url: string;
        type: 'image' | 'video';
    } | null>(null);

    const handleDelete = (fileId: string) => {
        if (onDelete) {
            onDelete(fileId);
        } else {
            removeFile(fileId);
        }
    };

    const handlePreview = (file: any) => {
        if (file.mimeType.startsWith('image/')) {
            setPreviewFile({
                url: file.url,
                type: 'image',
            });
        } else if (file.mimeType.startsWith('video/')) {
            setPreviewFile({
                url: file.url,
                type: 'video',
            });
        }
    };

    const filteredFiles = uploadHistory.filter((file) => {
        if (filter === 'all') return true;
        if (filter === 'image') return file.mimeType.startsWith('image/');
        if (filter === 'video') return file.mimeType.startsWith('video/');
        if (filter === 'document')
            return (
                !file.mimeType.startsWith('image/') &&
                !file.mimeType.startsWith('video/')
            );
        return true;
    });

    if (uploadHistory.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <FilePreviewModal
                visible={!!previewFile}
                onClose={() => setPreviewFile(null)}
                fileUrl={previewFile?.url || ''}
                fileType={previewFile?.type || 'image'}
            />
            <View style={styles.header}>
                <Text style={styles.title}>Upload History</Text>
                <FileFilter onFilterChange={setFilter} currentFilter={filter} />
            </View>
            <View style={styles.grid}>
                {filteredFiles.map((file) => (
                    <Animated.View
                        key={file.id}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={styles.fileCard}
                    >
                        <TouchableOpacity
                            onPress={() => handlePreview(file)}
                            disabled={
                                !file.mimeType.startsWith('image/') &&
                                !file.mimeType.startsWith('video/')
                            }
                            style={styles.cardTouchable}
                        >
                            <BlurView
                                intensity={50}
                                style={styles.blurContainer}
                            >
                                {file.thumbnailUrl ? (
                                    <Image
                                        source={getFileUrl(file.thumbnailUrl)}
                                        style={styles.thumbnail}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                ) : (
                                    <View style={styles.placeholder}>
                                        <Ionicons
                                            name={
                                                file.mimeType.startsWith(
                                                    'image/'
                                                )
                                                    ? 'image'
                                                    : file.mimeType.startsWith(
                                                          'video/'
                                                      )
                                                    ? 'videocam'
                                                    : 'document'
                                            }
                                            size={32}
                                            color="#8E8E93"
                                        />
                                    </View>
                                )}
                                <View style={styles.fileInfo}>
                                    <Text
                                        style={styles.fileName}
                                        numberOfLines={1}
                                    >
                                        {file.name}
                                    </Text>
                                    <Text style={styles.fileSize}>
                                        {(file.size / 1024 / 1024).toFixed(1)}{' '}
                                        MB
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(file.id)}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={20}
                                        color="#FF3B30"
                                    />
                                </TouchableOpacity>
                            </BlurView>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    fileCard: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cardTouchable: {
        flex: 1,
    },
    blurContainer: {
        flex: 1,
        padding: 12,
    },
    thumbnail: {
        width: '100%',
        height: '60%',
        borderRadius: 8,
    },
    placeholder: {
        width: '100%',
        height: '60%',
        borderRadius: 8,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileInfo: {
        marginTop: 8,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000000',
    },
    fileSize: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    deleteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 4,
    },
});
