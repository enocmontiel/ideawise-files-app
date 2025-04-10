import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    ScrollView,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useUpload } from '../../hooks/useUpload';
import { FilePreview } from '../../components/FilePreview';
import { createUploadStyles } from './styles';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useUploadStore } from '../../store/uploadStore';

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

    const { activeUploads } = useUploadStore();
    const insets = useSafeAreaInsets();
    const styles = createUploadStyles('light');

    // Calculate overall progress
    const calculateOverallProgress = () => {
        if (selectedFiles.length === 0) return 0;
        const totalProgress = selectedFiles.reduce((acc, file) => {
            const fileProgress = activeUploads[file.id]?.progress || 0;
            return acc + fileProgress;
        }, 0);
        return totalProgress / selectedFiles.length;
    };

    const overallProgress = calculateOverallProgress();

    const renderFilePreview = ({ item }: { item: any }) => (
        <FilePreview
            id={item.id}
            name={item.name}
            size={item.size}
            type={item.type}
            uri={item.uri}
            thumbnail={item.thumbnail}
            colorScheme="light"
            onRemove={removeFile}
            formatFileSize={formatFileSize}
        />
    );

    return (
        <>
            <View
                style={[
                    styles.container,
                    { backgroundColor: Colors.light.background },
                ]}
            >
                <ScreenHeader title="Upload Files" />
                <View style={styles.content}>
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
                                color={Colors.light.tint}
                                style={{ marginBottom: 4 }}
                            />
                            <Text style={styles.dropText}>Drop files here</Text>
                        </div>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.button,
                                {
                                    backgroundColor: Colors.light.tint,
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
                                        backgroundColor: Colors.light.tint,
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
                </View>
            </View>
            {selectedFiles.length > 0 && (
                <View style={styles.floatingButtonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.floatingButton,
                            {
                                backgroundColor: Colors.light.tint,
                                opacity: isUploading ? 0.7 : 1,
                            },
                        ]}
                        onPress={handleUploadAll}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <ActivityIndicator
                                    size="small"
                                    color="white"
                                    style={styles.buttonSpinner}
                                />
                                <Text style={styles.floatingButtonText}>
                                    Uploading...{' '}
                                    {Math.round(overallProgress * 100)}%
                                </Text>
                            </>
                        ) : (
                            <>
                                <MaterialCommunityIcons
                                    name="cloud-upload"
                                    size={24}
                                    color="white"
                                />
                                <Text style={styles.floatingButtonText}>
                                    Upload All Files
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}
