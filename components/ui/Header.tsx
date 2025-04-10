import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: Colors.light.text }]}>
                {title}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: Platform.OS === 'ios' ? 100 : 80,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
        backgroundColor: Colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
    },
});
