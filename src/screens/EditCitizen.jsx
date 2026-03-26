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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { updateCitizen } from '../services/CitizenService';

const EditCitizen = ({ navigation, route }) => {
  const { citizen } = route.params;

  // Form state
  const [name, setName] = useState(citizen.name);
  const [lastName, setLastName] = useState(citizen.lastName);
  const [email, setEmail] = useState(citizen.email || '');
  const [adress, setAdress] = useState(citizen.adress || '');
  const [phone, setPhone] = useState(citizen.phone || '');

  // Initial state for change detection
  const [initialState, setInitialState] = useState({
    name: citizen.name,
    lastName: citizen.lastName,
    email: citizen.email || '',
    adress: citizen.adress || '',
    phone: citizen.phone || '',
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Limpiar errores al montar el componente
  useEffect(() => {
    setErrors({});
  }, []);

  /**
   * Detectar si hay cambios en el formulario
   */
  const hasLocalChanges = () => {
    return (
      name !== initialState.name ||
      lastName !== initialState.lastName ||
      email !== initialState.email ||
      adress !== initialState.adress ||
      phone !== initialState.phone
    );
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};
    const onlyNumbers = /^[0-9]+$/;

    if (!name || name.trim().length === 0) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!lastName || lastName.trim().length === 0) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    // DN I is read-only in edit form; skipping DNI validation here

    // Email es obligatorio y debe tener formato válido
    if (!email || email.trim().length === 0) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Adress es obligatorio
    if (!adress || adress.trim().length === 0) {
      newErrors.adress = 'La dirección es obligatoria';
    }

    // Phone es obligatorio
    if (!phone || phone.trim().length === 0) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (phone.includes('-')) {
      newErrors.phone = 'El teléfono debe ser un número positivo (no se aceptan negativos).';
    } else if (!onlyNumbers.test(phone.trim())) {
      newErrors.phone = 'El teléfono solo puede contener números.';
    } else if (phone.trim().length !== 10) {
      newErrors.phone = 'El teléfono debe tener exactamente 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Guardar cambios
   */
  const handleSave = async () => {
    // Si no hay cambios, solo cerrar
    if (!hasLocalChanges()) {
      navigation.goBack();
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validación', 'Por favor completa los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const updatedCitizen = {
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        adress: adress.trim(),
        phone: phone.trim(), // Sin DNI en update (el identificador se pasa como parámetro)
      };

      await updateCitizen(citizen.dni, updatedCitizen);
      Alert.alert('Éxito', 'Ciudadano actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log('Error actualizando ciudadano:', error);
      const errorMessage = error?.message || 'No se pudo actualizar el ciudadano';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Editar Ciudadano</Text>

        {/* DNI (Deshabilitado) */}
        <View style={styles.section}>
          <Text style={styles.label}>DNI</Text>
          <View style={styles.disabledInput}>
            <Text style={styles.disabledText}>{citizen.dni}</Text>
            <MaterialCommunityIcons name="lock" size={16} color="#999" />
          </View>
          <Text style={styles.helperText}>El DNI no se puede cambiar</Text>
        </View>

        {/* Nombre */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Nombre <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Nombre completo"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Apellido */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Apellido <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Apellido"
            placeholderTextColor="#999"
            value={lastName}
            onChangeText={setLastName}
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Teléfono */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Teléfono/Celular <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="+54 9 2346 123456"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Dirección */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Dirección <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.adress && styles.inputError]}
            placeholder="Calle, número, piso"
            placeholderTextColor="#999"
            value={adress}
            onChangeText={setAdress}
          />
          {errors.adress && <Text style={styles.errorText}>{errors.adress}</Text>}
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
    marginBottom: 18,
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
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    color: '#212529',
    fontFamily: 'System',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1.5,
  },
  disabledInput: {
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
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 6,
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

export default EditCitizen;
