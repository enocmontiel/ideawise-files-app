import { Tabs } from 'expo-router';
import React, { useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useNotificationStore } from '../../store/notificationStore';

export default function TabLayout() {
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const notifications = useNotificationStore((state) => state.notifications);

    useEffect(() => {
        console.log('Current notifications:', {
            notifications,
            unreadCount,
            totalCount: notifications.length,
        });
    }, [notifications, unreadCount]);

    const screenOptions = useMemo(
        () => ({
            tabBarActiveTintColor: Colors.light.tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: {
                ...Platform.select({
                    ios: {
                        position: 'absolute',
                    },
                    web: {
                        backgroundColor: '#fff',
                        borderTopColor: '#eee',
                    },
                    default: {},
                }),
            },
            headerStyle: {
                backgroundColor: Colors.light.background,
            },
            headerTintColor: Colors.light.text,
        }),
        []
    );

    const uploadOptions = useMemo(
        () => ({
            title: 'Upload',
            tabBarIcon: ({ color }: { color: string }) => (
                <MaterialCommunityIcons
                    name="cloud-upload"
                    size={28}
                    color={color}
                />
            ),
        }),
        []
    );

    const filesOptions = useMemo(
        () => ({
            title: 'Files',
            tabBarIcon: ({ color }: { color: string }) => (
                <MaterialCommunityIcons
                    name="folder-multiple"
                    size={28}
                    color={color}
                />
            ),
        }),
        []
    );

    const notificationsOptions = useMemo(
        () => ({
            title: 'Notifications',
            tabBarIcon: ({ color }: { color: string }) => (
                <MaterialCommunityIcons name="bell" size={28} color={color} />
            ),
            tabBarBadge:
                notifications.length > 0 && unreadCount > 0
                    ? unreadCount
                    : undefined,
        }),
        [notifications.length, unreadCount]
    );

    return (
        <Tabs screenOptions={screenOptions}>
            <Tabs.Screen name="index" options={uploadOptions} />
            <Tabs.Screen name="files" options={filesOptions} />
            <Tabs.Screen name="notifications" options={notificationsOptions} />
        </Tabs>
    );
}
