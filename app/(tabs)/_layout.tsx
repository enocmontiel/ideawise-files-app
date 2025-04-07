import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: 'absolute',
                    },
                    default: {},
                }),
                headerStyle: {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                },
                headerTintColor: Colors[colorScheme ?? 'light'].text,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Upload',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="cloud-upload"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="files"
                options={{
                    title: 'Files',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="folder-multiple"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Notifications',
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="bell"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
