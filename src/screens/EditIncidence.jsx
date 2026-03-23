import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import TopBar from '../components/TopBar';
import { updateIncidence } from '../services/incidenceService';
import { get } from '../services/apiClient';

const TIPO_OPTIONS = [
  { value: 0, label: 'Chapas' },
  { value: 1, label: 'Bolsón' },
  { value: 2, label: 'Reclamo' },
  { value: 3, label: 'Licencia' },
  { value: 4, label: 'Trámite' },
  { value: 5, label: 'Otros' },
];

const ESTADO_OPTIONS = [
  { value: 0, label: 'Iniciado' },
  { value: 1, label: 'En progreso' },
  { value: 2, label: 'Finalizado' },
];

const EditIncidence = ({ navigation, route }) => {
  const { incidence } = route.params;

  // Form state
  const [date, setDate] = useState(new Date(incidence.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tipoSelected, setTipoSelected] = useState(incidence.incidenceType);
  const [estadoSelected, setEstadoSelected] = useState(incidence.state);
  const [areaSelected, setAreaSelected] = useState(incidence.areaId.toString());
  const [observacion, setObservacion] = useState(incidence.description);

  // UI state
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar áreas
  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoadingAreas(true);
      const data = await get('/Area');
      setAreas(data || []);
    } catch (error) {
      console.error('Error cargando áreas:', error);
      Alert.alert('Error', 'No se pudieron cargar las áreas');
    } finally {
      setLoadingAreas(false);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!areaSelected) {
      newErrors.area = 'Selecciona un área';
    }

    if (!observacion || observacion.trim().length < 10) {
      newErrors.observacion = 'La observación debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambio de fecha
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validación', 'Por favor completa los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const updatedIncidence = {
        date: date.toISOString(),
        incidenceType: tipoSelected,
        state: estadoSelected,
        areaId: parseInt(areaSelected),
        description: observacion.trim(),
      };

      await updateIncidence(incidence.id, updatedIncidence);
      Alert.alert('Éxito', 'Incidencia actualizada correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error actualizando incidencia:', error);
      Alert.alert('Error', 'No se pudo actualizar la incidencia');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedAreaLabel = () => {
    if (!areaSelected) return 'Selecciona un área';
    const area = areas.find((a) => a.id.toString() === areaSelected);
    return area ? area.name : 'Área no encontrada';
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Editar Incidencia</Text>

        {/* Fecha */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Fecha <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons name="calendar" size={20} color="#428bc4" />
            <Text style={styles.dateButtonText}>
              {date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Tipo */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Tipo de Incidencia <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setShowTipoDropdown(!showTipoDropdown);
              setShowEstadoDropdown(false);
              setShowAreaDropdown(false);
            }}
          >
            <Text style={styles.dropdownText}>
              {TIPO_OPTIONS.find((o) => o.value === tipoSelected)?.label}
            </Text>
            <MaterialCommunityIcons
              name={showTipoDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {showTipoDropdown && (
            <View style={styles.dropdownList}>
              {TIPO_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    tipoSelected === option.value && styles.selectedItem,
                  ]}
                  onPress={() => {
                    setTipoSelected(option.value);
                    setShowTipoDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      tipoSelected === option.value && styles.selectedItemText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Estado */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Estado <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setShowEstadoDropdown(!showEstadoDropdown);
              setShowTipoDropdown(false);
              setShowAreaDropdown(false);
            }}
          >
            <Text style={styles.dropdownText}>
              {ESTADO_OPTIONS.find((o) => o.value === estadoSelected)?.label}
            </Text>
            <MaterialCommunityIcons
              name={showEstadoDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {showEstadoDropdown && (
            <View style={styles.dropdownList}>
              {ESTADO_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    estadoSelected === option.value && styles.selectedItem,
                  ]}
                  onPress={() => {
                    setEstadoSelected(option.value);
                    setShowEstadoDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      estadoSelected === option.value && styles.selectedItemText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Área (Deshabilitada en edición) */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Área Responsable <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.disabledDropdown}>
            <Text style={styles.disabledText}>
              {getSelectedAreaLabel()}
            </Text>
            <MaterialCommunityIcons name="lock" size={16} color="#999" />
          </View>
          <Text style={styles.helperText}>No se puede cambiar el área en edición</Text>
        </View>

        {/* Observación */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Observación <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.textArea,
              errors.observacion && styles.inputError,
            ]}
            placeholder="Detalles de la incidencia..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={observacion}
            onChangeText={setObservacion}
            textAlignVertical="top"
          />
          {errors.observacion && (
            <Text style={styles.errorText}>{errors.observacion}</Text>
          )}
          <Text style={styles.charCount}>
            {observacion.length} caracteres
          </Text>
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 24,
    marginTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  required: {
    color: '#dc3545',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 10,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#212529',
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownText: {
    fontSize: 14,
    color: '#212529',
    flex: 1,
  },
  dropdownList: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    zIndex: 10,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#666',
  },
  selectedItem: {
    backgroundColor: '#e8f4fd',
  },
  selectedItemText: {
    color: '#428bc4',
    fontWeight: '600',
  },
  disabledDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabledText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    color: '#212529',
    minHeight: 100,
    fontFamily: 'System',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 6,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#428bc4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default EditIncidence;
