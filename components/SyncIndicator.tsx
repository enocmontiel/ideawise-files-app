import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SyncStatus } from '../types/api';

interface SyncIndicatorProps {
    status: SyncStatus;
    onRetry?: () => void;
}

export default function SyncIndicator({ status, onRetry }: SyncIndicatorProps) {
    if (status === 'syncing') {
        return (
            <ActivityIndicator
                style={styles.container}
                color={Colors.light.tint}
                size="small"
            />
        );
    }

    const iconName = status === 'synced' ? 'checkmark-circle' : 'sync';
    const iconColor =
        status === 'synced' ? Colors.light.success : Colors.light.error;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={status === 'error' ? onRetry : undefined}
            disabled={status === 'synced'}
        >
            <Ionicons name={iconName} size={24} color={iconColor} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        marginRight: 8,
    },
});
