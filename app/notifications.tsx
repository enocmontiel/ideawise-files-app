import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { useNotificationStore, Notification } from '../store/notificationStore';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

type IconName =
    | 'check-circle'
    | 'error'
    | 'warning'
    | 'info'
    | 'close'
    | 'notifications-none';

export default function NotificationsScreen() {
    const { notifications, markAllAsRead, removeNotification, markAsRead } =
        useNotificationStore();

    const renderNotification = ({
        item: notification,
    }: {
        item: Notification;
    }) => {
        const iconName: IconName = {
            success: 'check-circle',
            error: 'error',
            warning: 'warning',
            info: 'info',
        }[notification.type];

        const iconColor = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3',
        }[notification.type];

        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadNotification,
                ]}
                onPress={() => markAsRead(notification.id)}
            >
                <View style={styles.notificationContent}>
                    <MaterialIcons
                        name={iconName}
                        size={24}
                        color={iconColor}
                        style={styles.icon}
                    />
                    <View style={styles.textContainer}>
                        <ThemedText style={styles.title}>
                            {notification.title}
                        </ThemedText>
                        <ThemedText style={styles.message}>
                            {notification.message}
                        </ThemedText>
                        <ThemedText style={styles.timestamp}>
                            {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                            })}
                        </ThemedText>
                    </View>
                    <TouchableOpacity
                        onPress={() => removeNotification(notification.id)}
                        style={styles.deleteButton}
                    >
                        <MaterialIcons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>
                    Notifications
                </ThemedText>
                <TouchableOpacity onPress={markAllAsRead}>
                    <ThemedText style={styles.markAllRead}>
                        Mark all as read
                    </ThemedText>
                </TouchableOpacity>
            </View>
            {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialIcons
                        name="notifications-none"
                        size={48}
                        color="#999"
                    />
                    <ThemedText style={styles.emptyStateText}>
                        No notifications yet
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    markAllRead: {
        color: '#2196F3',
    },
    list: {
        padding: 16,
    },
    notificationItem: {
        marginBottom: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    unreadNotification: {
        backgroundColor: '#f0f9ff',
    },
    notificationContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
    },
    deleteButton: {
        padding: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
});
