import React, { useEffect } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { NotificationType } from '../../store/notificationStore';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { MaterialIcons } from '@expo/vector-icons';

interface ToastProps {
    type: NotificationType;
    message: string;
    onDismiss: () => void;
    duration?: number;
}

const getIconName = (type: NotificationType) => {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'error';
        case 'warning':
            return 'warning';
        case 'info':
            return 'info';
    }
};

const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
        case 'success':
            return '#4CAF50';
        case 'error':
            return '#F44336';
        case 'warning':
            return '#FF9800';
        case 'info':
            return '#2196F3';
    }
};

export const Toast: React.FC<ToastProps> = ({
    type,
    message,
    onDismiss,
    duration = 3000,
}) => {
    const opacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(duration),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => onDismiss());
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity, backgroundColor: getBackgroundColor(type) },
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={onDismiss}
                activeOpacity={0.8}
            >
                <MaterialIcons
                    name={getIconName(type)}
                    size={24}
                    color="white"
                    style={styles.icon}
                />
                <ThemedText style={styles.message}>{message}</ThemedText>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        borderRadius: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        color: 'white',
        flex: 1,
        fontSize: 16,
    },
});
