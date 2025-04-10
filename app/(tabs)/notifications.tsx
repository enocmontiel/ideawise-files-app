import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { useCallback } from 'react';
import { Colors } from '../../constants/Colors';
import { useNotificationStore } from '../../store/notificationStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/ui/ScreenHeader';

type Notification = {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
};

export default function NotificationsScreen() {
    const notifications = useNotificationStore((state) => state.notifications);
    const markAsRead = useNotificationStore((state) => state.markAsRead);
    const removeNotification = useNotificationStore(
        (state) => state.removeNotification
    );
    const clearAllNotifications = useNotificationStore(
        (state) => state.clearAll
    );

    const handleClearAll = useCallback(() => {
        clearAllNotifications();
    }, [clearAllNotifications]);

    const renderClearButton = useCallback(() => {
        if (notifications.length === 0) return null;

        return (
            <Pressable
                onPress={handleClearAll}
                style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.clearButtonPressed,
                ]}
            >
                <Text style={styles.clearButtonText}>Clear All</Text>
            </Pressable>
        );
    }, [notifications.length, handleClearAll]);

    const renderNotification = useCallback(
        ({ item: notification }: { item: Notification }) => {
            const handleMarkAsRead = () => {
                if (!notification.read) {
                    markAsRead(notification.id);
                }
            };

            const handleRemove = () => {
                removeNotification(notification.id);
            };

            return (
                <Pressable
                    onPress={handleMarkAsRead}
                    style={[
                        styles.notificationItem,
                        !notification.read && styles.unreadNotification,
                    ]}
                >
                    <View style={styles.notificationContent}>
                        <Text
                            style={[
                                styles.notificationTitle,
                                { color: Colors.light.text },
                            ]}
                        >
                            {notification.title}
                        </Text>
                        <Text
                            style={[
                                styles.notificationMessage,
                                { color: Colors.light.text },
                            ]}
                        >
                            {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                            {new Date(notification.timestamp).toLocaleString()}
                        </Text>
                    </View>
                    <Pressable
                        onPress={handleRemove}
                        style={styles.removeButton}
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={20}
                            color={Colors.light.text}
                        />
                    </Pressable>
                </Pressable>
            );
        },
        [markAsRead, removeNotification]
    );

    const renderContent = () => {
        if (!notifications.length) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.title, { color: Colors.light.text }]}>
                        No Notifications
                    </Text>
                    <Text
                        style={[styles.subtitle, { color: Colors.light.text }]}
                    >
                        Upload status and system notifications will appear here
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                style={styles.list}
            />
        );
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: Colors.light.background },
            ]}
        >
            <ScreenHeader
                title="Notifications"
                rightContent={renderClearButton()}
            />
            {renderContent()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadNotification: {
        backgroundColor: '#f0f9ff',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        marginBottom: 4,
        opacity: 0.8,
    },
    notificationTime: {
        fontSize: 12,
        opacity: 0.6,
    },
    removeButton: {
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
        textAlign: 'center',
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: Colors.light.tint,
    },
    clearButtonPressed: {
        opacity: 0.8,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});
