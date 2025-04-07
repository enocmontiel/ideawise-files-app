import { StyleSheet, View, Text } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function NotificationsScreen() {
    const colorScheme = useColorScheme();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: Colors[colorScheme ?? 'light'].background },
            ]}
        >
            <Text
                style={[
                    styles.title,
                    { color: Colors[colorScheme ?? 'light'].text },
                ]}
            >
                Notifications
            </Text>
            <Text
                style={[
                    styles.subtitle,
                    { color: Colors[colorScheme ?? 'light'].text },
                ]}
            >
                Upload status and system notifications will appear here
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
    },
});
