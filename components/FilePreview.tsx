import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

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
    return (
        <View
            style={[
                styles.filePreview,
                { backgroundColor: Colors[colorScheme].background },
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
                    </Text>
                </View>
            </View>
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
    removeButton: {
        padding: 8,
    },
});
