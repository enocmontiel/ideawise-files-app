import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileMetadata, UploadProgress, UploadState } from '../types/api';

interface UploadStore extends UploadState {
    addFile: (file: FileMetadata) => void;
    removeFile: (fileId: string) => void;
    updateUploadProgress: (fileId: string, progress: UploadProgress) => void;
    clearUploadHistory: () => void;
    setActiveUploads: (uploads: Record<string, UploadProgress>) => void;
}

export const useUploadStore = create<UploadStore>()(
    persist(
        (set) => ({
            files: [],
            activeUploads: {},
            uploadHistory: [],

            addFile: (file) =>
                set((state) => ({
                    files: [...state.files, file],
                    uploadHistory: [file, ...state.uploadHistory],
                })),

            removeFile: (fileId) =>
                set((state) => ({
                    files: state.files.filter((f) => f.id !== fileId),
                    activeUploads: Object.fromEntries(
                        Object.entries(state.activeUploads).filter(
                            ([id]) => id !== fileId
                        )
                    ),
                })),

            updateUploadProgress: (fileId, progress) =>
                set((state) => ({
                    activeUploads: {
                        ...state.activeUploads,
                        [fileId]: progress,
                    },
                })),

            clearUploadHistory: () =>
                set(() => ({
                    uploadHistory: [],
                })),

            setActiveUploads: (uploads) =>
                set(() => ({
                    activeUploads: uploads,
                })),
        }),
        {
            name: 'upload-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
