import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Modal,
    Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export type FileFilterType = 'all' | 'image' | 'video' | 'document';

interface FileFilterProps {
    onFilterChange: (filter: FileFilterType) => void;
    currentFilter: FileFilterType;
}

export const FileFilter: React.FC<FileFilterProps> = ({
    onFilterChange,
    currentFilter,
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const filters: { type: FileFilterType; label: string; icon: string }[] = [
        { type: 'all', label: 'All Files', icon: 'folder' },
        { type: 'image', label: 'Images', icon: 'image' },
        { type: 'video', label: 'Videos', icon: 'videocam' },
        { type: 'document', label: 'Documents', icon: 'description' },
    ];

    const handleSelect = (type: FileFilterType) => {
        onFilterChange(type);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.filterButton}
            >
                <MaterialIcons name="filter-list" size={24} color="#666" />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <ThemedView style={styles.modalContent}>
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter.type}
                                style={[
                                    styles.filterItem,
                                    currentFilter === filter.type &&
                                        styles.selectedFilter,
                                ]}
                                onPress={() => handleSelect(filter.type)}
                            >
                                <MaterialIcons
                                    name={filter.icon as any}
                                    size={24}
                                    color={
                                        currentFilter === filter.type
                                            ? '#2196F3'
                                            : '#666'
                                    }
                                    style={styles.filterIcon}
                                />
                                <ThemedText
                                    style={[
                                        styles.filterText,
                                        currentFilter === filter.type &&
                                            styles.selectedFilterText,
                                    ]}
                                >
                                    {filter.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ThemedView>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    filterButton: {
        padding: 8,
        marginRight: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        maxWidth: 300,
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    filterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
    },
    selectedFilter: {
        backgroundColor: '#E3F2FD',
    },
    filterIcon: {
        marginRight: 12,
    },
    filterText: {
        fontSize: 16,
        color: '#666',
    },
    selectedFilterText: {
        color: '#2196F3',
        fontWeight: 'bold',
    },
});
