import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    FileMetadata,
    UploadProgress,
    UploadState,
    SyncStatus,
} from '../types/api';
import { fileService } from '../services/fileService';
import { useNotificationStore } from './notificationStore';

interface UploadStore extends UploadState {
    addFile: (file: FileMetadata) => void;
    removeFile: (fileId: string) => void;
    updateUploadProgress: (fileId: string, progress: UploadProgress) => void;
    clearUploadHistory: () => void;
    setActiveUploads: (uploads: Record<string, UploadProgress>) => void;
    setSyncStatus: (status: SyncStatus) => void;
    syncWithRemote: () => Promise<void>;
}

export const useUploadStore = create<UploadStore>()(
    persist(
        (set, get) => ({
            files: [],
            activeUploads: {},
            uploadHistory: [],
            syncStatus: 'synced',
            lastSyncTime: undefined,

            addFile: (file) => {
                set((state) => ({
                    files: [...state.files, file],
                    uploadHistory: [file, ...state.uploadHistory],
                }));

                // Add success notification
                useNotificationStore.getState().addNotification({
                    type: 'success',
                    title: 'File Uploaded',
                    message: `${file.name} has been uploaded successfully`,
                });
            },

            removeFile: (fileId) => {
                const state = get();
                const file = state.files.find((f) => f.id === fileId);

                set((state) => ({
                    files: state.files.filter((f) => f.id !== fileId),
                    uploadHistory: state.uploadHistory.filter(
                        (f) => f.id !== fileId
                    ),
                    activeUploads: Object.fromEntries(
                        Object.entries(state.activeUploads).filter(
                            ([id]) => id !== fileId
                        )
                    ),
                }));

                if (file) {
                    useNotificationStore.getState().addNotification({
                        type: 'info',
                        title: 'File Removed',
                        message: `${file.name} has been removed`,
                    });
                }
            },

            updateUploadProgress: (fileId, progress) => {
                const state = get();
                const file = state.files.find((f) => f.id === fileId);

                set((state) => ({
                    activeUploads: {
                        ...state.activeUploads,
                        [fileId]: progress,
                    },
                }));

                if (progress.error) {
                    useNotificationStore.getState().addNotification({
                        type: 'error',
                        title: 'Upload Failed',
                        message: `Failed to upload ${file?.name || 'file'}: ${
                            progress.error
                        }`,
                    });
                }
            },

            clearUploadHistory: () =>
                set(() => ({
                    uploadHistory: [],
                })),

            setActiveUploads: (uploads) =>
                set(() => ({
                    activeUploads: uploads,
                })),

            setSyncStatus: (status: SyncStatus) => {
                set(() => ({
                    syncStatus: status,
                    lastSyncTime:
                        status === 'synced'
                            ? new Date().toISOString()
                            : undefined,
                }));

                if (status === 'error') {
                    useNotificationStore.getState().addNotification({
                        type: 'error',
                        title: 'Sync Failed',
                        message:
                            'Failed to sync with server. Please try again.',
                    });
                }
            },

            syncWithRemote: async () => {
                const store = get();
                try {
                    store.setSyncStatus('syncing');

                    // Fetch remote files
                    const remoteFiles = await fileService.listFiles();

                    // Create a map of remote files by ID for quick lookup
                    const remoteFileMap = new Map(
                        remoteFiles.map((file) => [file.id, file])
                    );

                    // Remove local files that don't exist remotely
                    const updatedHistory = store.uploadHistory.filter((file) =>
                        remoteFileMap.has(file.id)
                    );

                    // Add any new remote files that don't exist locally
                    const localFileIds = new Set(
                        updatedHistory.map((file) => file.id)
                    );
                    const newRemoteFiles = remoteFiles.filter(
                        (file) => !localFileIds.has(file.id)
                    );

                    set({
                        uploadHistory: [...newRemoteFiles, ...updatedHistory],
                        files: [...newRemoteFiles, ...updatedHistory],
                        syncStatus: 'synced',
                        lastSyncTime: new Date().toISOString(),
                    });

                    if (newRemoteFiles.length > 0) {
                        useNotificationStore.getState().addNotification({
                            type: 'info',
                            title: 'New Files Found',
                            message: `Found ${newRemoteFiles.length} new file(s) during sync`,
                        });
                    }
                } catch (error) {
                    console.error('Error syncing with remote:', error);
                    store.setSyncStatus('error');
                }
            },
        }),
        {
            name: 'upload-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
