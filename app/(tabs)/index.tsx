import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    ScrollView,
    FlatList,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useUpload } from '../../hooks/useUpload';
import UploadHistory from '../../components/UploadHistory';
import { FilePreview } from '../../components/FilePreview';
import { createUploadStyles } from './styles';

export default function UploadScreen() {
    const {
        isUploading,
        selectedFiles,
        isDragging,
        handleDrop,
        handleFilePick,
        handleUploadAll,
        removeFile,
        formatFileSize,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDropEvent,
    } = useUpload();

    const systemColorScheme = useColorScheme();
    const colorScheme = Platform.OS === 'web' ? 'light' : systemColorScheme;
    const insets = useSafeAreaInsets();
    const styles = createUploadStyles(colorScheme ?? 'light');

    const renderFilePreview = ({ item }: { item: any }) => (
        <FilePreview
            id={item.id}
            name={item.name}
            size={item.size}
            type={item.type}
            uri={item.uri}
            thumbnail={item.thumbnail}
            colorScheme={colorScheme ?? 'light'}
            onRemove={removeFile}
            formatFileSize={formatFileSize}
        />
    );

    return (
        <>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor:
                            Colors[colorScheme ?? 'light'].background,
                        paddingTop: insets.top,
                    },
                ]}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>Upload Files</Text>
                    <Text style={styles.subtitle}>
                        {Platform.OS === 'web'
                            ? 'Drag and drop files here or click to select'
                            : 'Select files to upload'}
                    </Text>

                    {Platform.OS === 'web' ? (
                        <div
                            style={
                                {
                                    ...(isDragging
                                        ? styles.dropZoneDragging
                                        : styles.dropZone),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                } as React.CSSProperties
                            }
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDropEvent}
                        >
                            <MaterialCommunityIcons
                                name="cloud-upload"
                                size={48}
                                color={Colors[colorScheme ?? 'light'].tint}
                                style={{ marginBottom: 4 }}
                            />
                            <Text style={styles.dropText}>Drop files here</Text>
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
                                <Text style={styles.buttonText}>
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
                        <View
                            style={[styles.selectedFilesContainer, { flex: 1 }]}
                        >
                            <Text style={styles.selectedFilesTitle}>
                                Selected Files ({selectedFiles.length})
                            </Text>
                            <FlatList
                                data={selectedFiles}
                                renderItem={renderFilePreview}
                                keyExtractor={(item) => item.id}
                                style={styles.fileList}
                                scrollEnabled={true}
                            />
                        </View>
                    )}

                    <UploadHistory />
                </View>
            </View>
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
                            Upload All Files
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}
