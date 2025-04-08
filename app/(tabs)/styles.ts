import { StyleSheet, Platform, ViewStyle } from 'react-native';
import { Colors } from '../../constants/Colors';

export const createUploadStyles = (colorScheme: 'light' | 'dark') => {
    const dropZoneStyle = Platform.select({
        web: {
            width: '100%',
            height: 200,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            borderColor: Colors[colorScheme].tint,
            backgroundColor: 'transparent',
        } as ViewStyle,
        default: {
            width: '100%',
            height: 200,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            borderColor: Colors[colorScheme].tint,
        } as ViewStyle,
    });

    return StyleSheet.create({
        container: {
            flex: 1,
            ...(Platform.OS === 'web'
                ? { height: '100%' as any, overflow: 'hidden' }
                : {}),
        },
        content: {
            flex: 1,
            alignItems: 'center',
            padding: 20,
            paddingBottom: 100,
            ...(Platform.OS === 'web'
                ? { overflowY: 'auto', height: '100%' as any }
                : {}),
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
            color: Colors[colorScheme].text,
        },
        subtitle: {
            fontSize: 16,
            opacity: 0.7,
            marginBottom: 20,
            color: Colors[colorScheme].text,
        },
        dropText: {
            fontSize: 18,
            color: Colors[colorScheme].text,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 20,
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderRadius: 8,
            gap: 8,
            backgroundColor: Colors[colorScheme].tint,
        },
        buttonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
        selectedFilesContainer: {
            width: '100%',
            marginBottom: 20,
            ...(Platform.OS === 'web' ? { minHeight: 200 } : { flex: 1 }),
        },
        selectedFilesTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 10,
            color: Colors[colorScheme].text,
        },
        fileList: {
            width: '100%',
            ...(Platform.OS === 'web' ? { minHeight: 200 } : { flex: 1 }),
        },
        filePreview: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            backgroundColor: Colors[colorScheme].background,
        },
        fileInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        thumbnail: {
            width: 40,
            height: 40,
            borderRadius: 4,
            marginRight: 12,
        },
        thumbnailPlaceholder: {
            backgroundColor: '#F0F0F0',
            alignItems: 'center',
            justifyContent: 'center',
        },
        fileDetails: {
            flex: 1,
        },
        fileName: {
            fontSize: 16,
            fontWeight: '500',
            marginBottom: 4,
            color: Colors[colorScheme].text,
        },
        fileSize: {
            fontSize: 14,
            opacity: 0.7,
            color: Colors[colorScheme].text,
        },
        removeButton: {
            padding: 8,
        },
        floatingButtonContainer: {
            position: 'absolute',
            bottom: Platform.select({
                ios: 83,
                android: 0,
                web: 20,
            }),
            left: 0,
            right: 0,
            padding: 16,
            backgroundColor: 'transparent',
            zIndex: Platform.OS === 'web' ? 1000 : 1,
        },
        floatingButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            borderRadius: 12,
            gap: 8,
            backgroundColor: Colors[colorScheme].tint,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        floatingButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
        dropZone: dropZoneStyle,
        dropZoneDragging: Platform.select({
            web: {
                ...dropZoneStyle,
                borderStyle: 'solid',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
            } as ViewStyle,
            default: dropZoneStyle,
        }),
    });
};
