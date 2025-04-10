import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'device_id';

export const deviceIdUtil = {
    /**
     * Gets the device ID from localStorage or creates a new one if it doesn't exist
     */
    getDeviceId: async (): Promise<string> => {
        let deviceId = localStorage.getItem(DEVICE_ID_KEY);

        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem(DEVICE_ID_KEY, deviceId);
        }

        return deviceId;
    },

    /**
     * Sets a specific device ID (useful for testing or when migrating from another system)
     */
    setDeviceId: (deviceId: string): void => {
        if (!deviceId) {
            throw new Error('Device ID cannot be empty');
        }

        // Validate UUID format
        if (
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                deviceId
            )
        ) {
            throw new Error('Invalid device ID format. Must be a valid UUID.');
        }

        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    },

    /**
     * Clears the stored device ID (useful for logout/cleanup)
     */
    clearDeviceId: (): void => {
        localStorage.removeItem(DEVICE_ID_KEY);
    },
};
