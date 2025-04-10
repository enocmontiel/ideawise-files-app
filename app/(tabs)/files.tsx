import {
    StyleSheet,
    View,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import UploadHistory from '../../components/UploadHistory';
import EmptyState from '../../components/EmptyState';
import SyncIndicator from '../../components/SyncIndicator';
import { useEffect, useState } from 'react';
import { fileService } from '../../services/fileService';
import { useUploadStore } from '../../store/uploadStore';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

export default function FilesScreen() {
    const [isDeleting, setIsDeleting] = useState(false);
    const { removeFile, uploadHistory, syncStatus, syncWithRemote } =
        useUploadStore();

    useEffect(() => {
        // Initial sync when component mounts
        syncWithRemote();

        // Set up periodic sync (every 30 seconds)
        const syncInterval = setInterval(syncWithRemote, 30000);

        return () => clearInterval(syncInterval);
    }, []);

    const handleDelete = async (fileId: string) => {
        const confirmDelete = async () => {
            try {
                setIsDeleting(true);
                await fileService.deleteFile(fileId);
                removeFile(fileId);
                // Trigger a sync after deletion
                syncWithRemote();
            } catch (error) {
                if (Platform.OS === 'web') {
                    window.alert('Failed to delete file. Please try again.');
                } else {
                    Alert.alert(
                        'Error',
                        'Failed to delete file. Please try again.'
                    );
                }
            } finally {
                setIsDeleting(false);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this file?')) {
                await confirmDelete();
            }
        } else {
            Alert.alert(
                'Delete File',
                'Are you sure you want to delete this file?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: confirmDelete,
                    },
                ]
            );
        }
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: Colors.light.background },
            ]}
        >
            <ScreenHeader
                title="Files"
                rightContent={
                    <SyncIndicator
                        status={syncStatus}
                        onRetry={syncWithRemote}
                    />
                }
            />
            <ScrollView style={styles.scrollView}>
                {isDeleting && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={Colors.light.tint}
                        />
                    </View>
                )}
                {uploadHistory.length === 0 ? (
                    <EmptyState
                        title="No Files Yet"
                        message="Upload your first file to get started"
                        icon="cloud-upload-outline"
                    />
                ) : (
                    <UploadHistory onDelete={handleDelete} />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
});
