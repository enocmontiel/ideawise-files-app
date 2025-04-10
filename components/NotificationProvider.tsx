import React, { createContext, useContext, useState } from 'react';
import { View } from 'react-native';
import { Toast } from './ui/Toast';
import {
    useNotificationStore,
    NotificationType,
} from '../store/notificationStore';

interface NotificationContextType {
    showToast: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            'useNotifications must be used within a NotificationProvider'
        );
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [activeToast, setActiveToast] = useState<{
        type: NotificationType;
        message: string;
    } | null>(null);
    const addNotification = useNotificationStore(
        (state) => state.addNotification
    );

    const showToast = (type: NotificationType, message: string) => {
        setActiveToast({ type, message });

        // Add to notification center
        addNotification({
            type,
            message,
            title: type.charAt(0).toUpperCase() + type.slice(1),
        });
    };

    const dismissToast = () => {
        setActiveToast(null);
    };

    return (
        <NotificationContext.Provider value={{ showToast }}>
            {children}
            {activeToast && (
                <Toast
                    type={activeToast.type}
                    message={activeToast.message}
                    onDismiss={dismissToast}
                />
            )}
        </NotificationContext.Provider>
    );
};
