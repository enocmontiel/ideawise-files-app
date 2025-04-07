import React, { useCallback, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Platform,
    ScrollView,
    useWindowDimensions,
    ViewStyle,
    Image,
    FlatList,
    ActionSheetIOS,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useUploadStore } from '../../store/uploadStore';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import UploadHistory from '../../components/UploadHistory';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

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

function UploadScreen() {
    const router = useRouter();
    const {
        isUploading,
        pickFiles,
        pickFromPhotos,
        pickFromCamera,
        uploadFile,
        cancelUpload,
    } = useFileUpload();
    const { activeUploads } = useUploadStore();
    const [isDragging, setIsDragging] = useState(false);
    const systemColorScheme = useColorScheme();
    const colorScheme = Platform.OS === 'web' ? 'light' : systemColorScheme;
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

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

    const handleDrop = useCallback(async (files: WebFile[]) => {
        setIsDragging(false);
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

    const handleDragOver = useCallback((e: any) => {
        e.preventDefault();
        setIsDragging(true);
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

    const renderFilePreview = ({ item }: { item: FilePreview }) => (
        <View
            style={[
                styles.filePreview,
                { backgroundColor: Colors[colorScheme ?? 'light'].background },
            ]}
        >
            <View style={styles.fileInfo}>
                {item.thumbnail ? (
                    <Image
                        source={{ uri: item.thumbnail }}
                        style={styles.thumbnail}
                    />
                ) : (
                    <View
                        style={[styles.thumbnail, styles.thumbnailPlaceholder]}
                    >
                        <MaterialCommunityIcons
                            name={
                                item.type.startsWith('video/')
                                    ? 'video'
                                    : 'file'
                            }
                            size={24}
                            color={Colors[colorScheme ?? 'light'].tint}
                        />
                    </View>
                )}
                <View style={styles.fileDetails}>
                    <Text
                        style={[
                            styles.fileName,
                            { color: Colors[colorScheme ?? 'light'].text },
                        ]}
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <Text
                        style={[
                            styles.fileSize,
                            { color: Colors[colorScheme ?? 'light'].text },
                        ]}
                    >
                        {formatFileSize(item.size)}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFile(item.id)}
            >
                <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color={Colors[colorScheme ?? 'light'].text}
                />
            </TouchableOpacity>
        </View>
    );

    const dropZoneStyle = Platform.select({
        web: {
            width: '100%',
            height: 200,
            borderWidth: 2,
            borderStyle: isDragging ? 'solid' : 'dashed',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            borderColor: Colors[colorScheme ?? 'light'].tint,
            backgroundColor: isDragging
                ? 'rgba(0, 122, 255, 0.1)'
                : 'transparent',
        } as ViewStyle,
        default: {
            width: '100%',
            height: 200,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            borderColor: Colors[colorScheme ?? 'light'].tint,
        } as ViewStyle,
    });

    return (
        <>
            <ScrollView
                style={[
                    styles.container,
                    {
                        backgroundColor:
                            Colors[colorScheme ?? 'light'].background,
                    },
                ]}
                contentContainerStyle={{ paddingTop: insets.top }}
            >
                <View style={styles.content}>
                    <Text
                        style={[
                            styles.title,
                            { color: Colors[colorScheme ?? 'light'].text },
                        ]}
                    >
                        Upload Files
                    </Text>
                    <Text
                        style={[
                            styles.subtitle,
                            { color: Colors[colorScheme ?? 'light'].text },
                        ]}
                    >
                        {Platform.OS === 'web'
                            ? 'Drag and drop files here or click to select'
                            : 'Select files to upload'}
                    </Text>

                    {Platform.OS === 'web' ? (
                        <div
                            style={{
                                ...(dropZoneStyle as any),
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDropEvent}
                        >
                            <MaterialCommunityIcons
                                name="cloud-upload"
                                size={48}
                                color={Colors[colorScheme ?? 'light'].tint}
                                style={{ marginBottom: 4 }}
                            />
                            <Text
                                style={[
                                    styles.dropText,
                                    {
                                        color: Colors[colorScheme ?? 'light']
                                            .text,
                                    },
                                ]}
                            >
                                Drop files here
                            </Text>
                        </div>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.button,
                                {
                                    backgroundColor:
                                        Colors[colorScheme ?? 'light'].tint,
                                    width: '100%',
                                    height: 200,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 12,
                                    marginBottom: 20,
                                    flexDirection: 'column',
                                    gap: 12,
                                },
                            ]}
                            onPress={handleFilePick}
                            disabled={isUploading}
                        >
                            <View>
                                <MaterialCommunityIcons
                                    name="cloud-upload"
                                    size={48}
                                    color="white"
                                />
                            </View>
                            <View>
                                <Text style={[styles.buttonText]}>
                                    Select Files
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    <View style={styles.buttonContainer}>
                        {Platform.OS === 'web' && (
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor:
                                            Colors[colorScheme ?? 'light'].tint,
                                    },
                                ]}
                                onPress={handleFilePick}
                                disabled={isUploading}
                            >
                                <MaterialCommunityIcons
                                    name="file"
                                    size={24}
                                    color="white"
                                />
                                <Text style={styles.buttonText}>
                                    Select Files
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {selectedFiles.length > 0 && (
                        <View style={styles.selectedFilesContainer}>
                            <Text
                                style={[
                                    styles.selectedFilesTitle,
                                    {
                                        color: Colors[colorScheme ?? 'light']
                                            .text,
                                    },
                                ]}
                            >
                                Selected Files ({selectedFiles.length})
                            </Text>
                            <FlatList
                                data={selectedFiles}
                                renderItem={renderFilePreview}
                                keyExtractor={(item) => item.id}
                                style={styles.fileList}
                            />
                        </View>
                    )}

                    <UploadHistory />
                </View>
            </ScrollView>
            {selectedFiles.length > 0 && (
                <View
                    style={[
                        styles.floatingButtonContainer,
                        { paddingBottom: insets.bottom },
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.floatingButton,
                            {
                                backgroundColor:
                                    Colors[colorScheme ?? 'light'].tint,
                            },
                        ]}
                        onPress={handleUploadAll}
                        disabled={isUploading}
                    >
                        <MaterialCommunityIcons
                            name="cloud-upload"
                            size={24}
                            color="white"
                        />
                        <Text style={styles.floatingButtonText}>
                            Upload {selectedFiles.length}{' '}
                            {selectedFiles.length === 1 ? 'File' : 'Files'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}

export default UploadScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
        marginBottom: 20,
    },
    dropText: {
        fontSize: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
        backgroundColor: '#007AFF',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    selectedFilesContainer: {
        width: '100%',
        marginBottom: 20,
    },
    selectedFilesTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    fileList: {
        width: '100%',
    },
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
    floatingButtonContainer: {
        position: 'absolute',
        bottom: Platform.select({
            ios: 83,
            android: 0,
            web: 20,
        }),
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'transparent',
        zIndex: Platform.OS === 'web' ? 1000 : 1,
    },
    floatingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    floatingButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
