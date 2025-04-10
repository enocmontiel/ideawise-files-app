import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

interface ScreenHeaderProps {
    title: string;
    rightContent?: ReactNode;
}

export function ScreenHeader({ title, rightContent }: ScreenHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <Text style={[styles.title, { color: Colors.light.text }]}>
                {title}
            </Text>
            {rightContent}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
