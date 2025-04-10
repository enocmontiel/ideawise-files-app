import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    title: string;
    timestamp: number;
    read: boolean;
}

export interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (
        notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
    ) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: Math.random().toString(36).substring(7),
                    timestamp: Date.now(),
                    read: false,
                };
                set((state) => ({
                    notifications: [newNotification, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                }));
            },
            markAsRead: (id) => {
                set((state) => {
                    const notifications = state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    );
                    const unreadCount = notifications.filter(
                        (n) => !n.read
                    ).length;
                    return { notifications, unreadCount };
                });
            },
            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({
                        ...n,
                        read: true,
                    })),
                    unreadCount: 0,
                }));
            },
            removeNotification: (id) => {
                set((state) => {
                    const notification = state.notifications.find(
                        (n) => n.id === id
                    );
                    const unreadCount = notification?.read
                        ? state.unreadCount
                        : state.unreadCount - 1;
                    return {
                        notifications: state.notifications.filter(
                            (n) => n.id !== id
                        ),
                        unreadCount,
                    };
                });
            },
            clearAll: () => {
                set({ notifications: [], unreadCount: 0 });
            },
        }),
        {
            name: 'notifications-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
