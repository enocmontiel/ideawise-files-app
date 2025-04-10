import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

export default function EmptyState({
    title = 'No Files Yet',
    message = 'Upload your first file to get started',
    icon = 'cloud-upload-outline',
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Ionicons
                name={icon}
                size={64}
                color={Colors.light.tint}
                style={styles.icon}
            />
            <Text style={[styles.title, { color: Colors.light.text }]}>
                {title}
            </Text>
            <Text style={[styles.message, { color: Colors.light.text }]}>
                {message}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
});
