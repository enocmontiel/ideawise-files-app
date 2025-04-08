import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useUploadStore } from '../store/uploadStore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { getFileUrl } from '../utils/fileUtils';

export default function UploadHistory() {
    const { uploadHistory, removeFile } = useUploadStore();

    const handleDelete = (fileId: string) => {
        removeFile(fileId);
    };

    if (uploadHistory.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Upload History</Text>
            <View style={styles.grid}>
                {uploadHistory.map((file) => (
                    <Animated.View
                        key={file.id}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={styles.fileCard}
                    >
                        <BlurView intensity={50} style={styles.blurContainer}>
                            {file.thumbnailUrl ? (
                                <Image
                                    source={{
                                        uri: getFileUrl(file.thumbnailUrl),
                                    }}
                                    style={styles.thumbnail}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.placeholder}>
                                    <Ionicons
                                        name={
                                            file.mimeType.startsWith('image/')
                                                ? 'image'
                                                : 'videocam'
                                        }
                                        size={32}
                                        color="#8E8E93"
                                    />
                                </View>
                            )}
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {file.name}
                                </Text>
                                <Text style={styles.fileSize}>
                                    {(file.size / 1024 / 1024).toFixed(1)} MB
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
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
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
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
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
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
});
