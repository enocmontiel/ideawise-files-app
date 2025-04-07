import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useUploadStore } from '../store/uploadStore';
import { uploadService } from '../services/api';

const BACKGROUND_UPLOAD_TASK = 'BACKGROUND_UPLOAD_TASK';

TaskManager.defineTask(BACKGROUND_UPLOAD_TASK, async () => {
    try {
        const { activeUploads } = useUploadStore.getState();
        const pendingUploads = Object.entries(activeUploads).filter(
            ([_, progress]) =>
                progress.status === 'pending' || progress.status === 'uploading'
        );

        if (pendingUploads.length === 0) {
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        for (const [fileId, progress] of pendingUploads) {
            try {
                const status = await uploadService.getUploadStatus(fileId);
                useUploadStore.getState().updateUploadProgress(fileId, {
                    ...progress,
                    progress: status.progress,
                    status: status.status as any,
                });
            } catch (error) {
                console.error(
                    `Error checking upload status for ${fileId}:`,
                    error
                );
            }
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error('Background upload task error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export const registerBackgroundUploadTask = async () => {
    try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_UPLOAD_TASK, {
            minimumInterval: 60, // 1 minute
            stopOnTerminate: false,
            startOnBoot: true,
        });
    } catch (error) {
        console.error('Error registering background upload task:', error);
    }
};

export const unregisterBackgroundUploadTask = async () => {
    try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_UPLOAD_TASK);
    } catch (error) {
        console.error('Error unregistering background upload task:', error);
    }
};
