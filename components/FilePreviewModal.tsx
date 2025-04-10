import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import { getFileUrl } from '../utils/fileUtils';

interface FilePreviewModalProps {
    visible: boolean;
    onClose: () => void;
    fileUrl: string;
    fileType: 'image' | 'video';
}

export default function FilePreviewModal({
    visible,
    onClose,
    fileUrl,
    fileType,
}: FilePreviewModalProps) {
    const url = getFileUrl(fileUrl);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.contentContainer}>
                    {fileType === 'image' ? (
                        <Image
                            source={{ uri: url }}
                            style={styles.media}
                            contentFit="contain"
                        />
                    ) : (
                        <Video
                            source={{ uri: url }}
                            style={styles.media}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping
                            shouldPlay
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: Platform.OS === 'web' ? '80%' : Dimensions.get('window').width,
        height:
            Platform.OS === 'web'
                ? '80%'
                : Dimensions.get('window').height * 0.8,
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 20 : 40,
        right: 20,
        zIndex: 1,
        padding: 8,
    },
});
