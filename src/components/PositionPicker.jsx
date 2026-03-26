import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Componente PositionPicker: Wrapper personalizado para roles
 * - iOS: Campo con modal profesional para seleccionar
 * - Android: Dropdown nativo
 */
const PositionPicker = ({ value, onValueChange, style, error }) => {
  const [showModal, setShowModal] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const POSITIONS = [
    { label: 'Operador Básico', value: '0' },
    { label: 'Admin', value: '1' },
    { label: 'SysAdmin', value: '2' },
  ];

  const getSelectedLabel = () => {
    const position = POSITIONS.find((p) => p.value === value);
    return position ? position.label : 'Seleccionar...';
  };

  const handleConfirm = () => {
    onValueChange(tempValue);
    setShowModal(false);
  };

  // iOS: Campo clickeable que abre modal
  if (Platform.OS === 'ios') {
    return (
      <>
        <TouchableOpacity
          style={[styles.iosField, error && styles.iosFieldError]}
          onPress={() => {
            setTempValue(value);
            setShowModal(true);
          }}
        >
          <Text style={styles.iosFieldText}>{getSelectedLabel()}</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color="#428bc4"
            style={styles.iosChevron}
          />
        </TouchableOpacity>

        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <SafeAreaView style={styles.iosModalContainer}>
            {/* Header */}
            <View style={styles.iosModalHeader}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.iosHeaderButton}
              >
                <Text style={styles.iosHeaderButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.iosModalTitle}>Seleccionar Cargo/Rol</Text>
              <TouchableOpacity
                onPress={handleConfirm}
                style={styles.iosHeaderButton}
              >
                <Text style={[styles.iosHeaderButtonText, styles.iosHeaderButtonConfirm]}>
                  Listo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Picker */}
            <View style={styles.iosModalContent}>
              <Picker
                selectedValue={tempValue}
                onValueChange={setTempValue}
                style={styles.iosModalPicker}
                itemStyle={styles.iosModalPickerItem}
              >
                {POSITIONS.map((position) => (
                  <Picker.Item
                    key={position.value}
                    label={position.label}
                    value={position.value}
                  />
                ))}
              </Picker>
            </View>
          </SafeAreaView>
        </Modal>
      </>
    );
  }

  // Android: Dropdown nativo
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.androidPickerWrapper, error && styles.androidPickerError]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.androidPicker}
          itemStyle={styles.androidPickerItem}
          mode="dropdown"
        >
          {POSITIONS.map((position) => (
            <Picker.Item
              key={position.value}
              label={position.label}
              value={position.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  // iOS Styles
  iosField: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iosFieldError: {
    borderColor: '#dc3545',
    borderWidth: 1.5,
  },
  iosFieldText: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '400',
  },
  iosChevron: {
    marginLeft: 8,
  },
  iosModalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  iosModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iosModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  iosHeaderButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  iosHeaderButtonText: {
    fontSize: 14,
    color: '#428bc4',
    fontWeight: '500',
  },
  iosHeaderButtonConfirm: {
    fontWeight: '600',
  },
  iosModalContent: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  iosModalPicker: {
    height: 200,
    fontSize: 16,
    color: '#212529',
  },
  iosModalPickerItem: {
    fontSize: 16,
    color: '#212529',
    height: 40,
  },

  // Android Styles
  androidPickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  androidPicker: {
    height: 56,
    fontSize: 14,
    color: '#212529',
  },
  androidPickerItem: {
    fontSize: 14,
    color: '#212529',
  },
  androidPickerError: {
    borderColor: '#dc3545',
    borderWidth: 1.5,
  },
});

export default PositionPicker;
