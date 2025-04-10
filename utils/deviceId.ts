import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'device_id';

/**
 * Generate a UUID using the appropriate method for the platform
 */
const generateUUID = async (): Promise<string> => {
    if (Platform.OS === 'web') {
        return uuidv4();
    }
    return await Crypto.randomUUID();
};

export const deviceIdUtil = {
    /**
     * Gets the device ID from AsyncStorage or creates a new one if it doesn't exist
     */
    getDeviceId: async (): Promise<string> => {
        try {
            let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

            if (!deviceId) {
                deviceId = await generateUUID();
                await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
            }

            return deviceId;
        } catch (error) {
            console.error('Error managing device ID:', error);
            // Generate a temporary ID if storage fails
            return await generateUUID();
        }
    },

    /**
     * Sets a specific device ID (useful for testing or when migrating from another system)
     */
    setDeviceId: async (deviceId: string): Promise<void> => {
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

        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    },

    /**
     * Clears the stored device ID (useful for logout/cleanup)
     */
    clearDeviceId: async (): Promise<void> => {
        await AsyncStorage.removeItem(DEVICE_ID_KEY);
    },
};
