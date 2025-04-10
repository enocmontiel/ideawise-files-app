import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function NotificationsScreen() {
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: Colors.light.background },
            ]}
        >
            <Text style={[styles.title, { color: Colors.light.text }]}>
                Notifications
            </Text>
            <Text style={[styles.subtitle, { color: Colors.light.text }]}>
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
