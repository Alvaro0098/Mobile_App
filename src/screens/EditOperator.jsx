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
import PositionPicker from '../components/PositionPicker';
import { updateOperator } from '../services/operatorService';

const EditOperator = ({ navigation, route }) => {
  const { operator } = route.params;

  // Form state
  const [dni, setDni] = useState(operator.dni?.toString() || '');
  const [name, setName] = useState(operator.name || '');
  const [lastName, setLastName] = useState(operator.lastName || '');
  const [nLegajo, setNLegajo] = useState(operator.nLegajo?.toString() || '');
  const [email, setEmail] = useState(operator.email || '');
  const [phone, setPhone] = useState(operator.phone || '');
  const [password, setPassword] = useState(''); // Opcional en EDIT
  const [position, setPosition] = useState((operator.position || 0).toString());

  // Initial state for change detection
  const [initialState, setInitialState] = useState({
    name: operator.name || '',
    lastName: operator.lastName || '',
    nLegajo: operator.nLegajo?.toString() || '',
    email: operator.email || '',
    phone: operator.phone || '',
    password: '', // La contraseña siempre comienza vacía en EDIT
    position: (operator.position || 0).toString(),
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
      nLegajo !== initialState.nLegajo ||
      email !== initialState.email ||
      phone !== initialState.phone ||
      password !== initialState.password ||
      position !== initialState.position
    );
  };

  /**
   * Validar formulario (sin requerir password en EDIT)
   */
  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // Name
    if (!name || name.trim().length === 0) {
      newErrors.name = 'El nombre es obligatorio';
    }

    // LastName
    if (!lastName || lastName.trim().length === 0) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    // Email
    if (!email || email.trim().length === 0) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato de email es inválido';
    }

    // Password - OPCIONAL en EDIT, pero si se proporciona, debe cumplir regex
    if (password && password.trim().length > 0) {
      if (!passwordRegex.test(password)) {
        newErrors.password = 'Min 8 caracteres (mayúscula, minúscula, número)';
      }
    }

    // N° Legajo - READ ONLY, no validar
    
    // Phone (opcional pero si se proporciona, debe ser válido)
    if (phone && phone.trim().length > 0) {
      const onlyNumbers = /^[0-9]+$/;
      if (phone.includes('-')) {
        newErrors.phone = 'El teléfono debe ser un número positivo (no se aceptan negativos).';
      } else if (!onlyNumbers.test(phone.trim())) {
        newErrors.phone = 'El teléfono solo puede contener números.';
      } else if (phone.trim().length > 10) {
        newErrors.phone = 'El teléfono no puede tener más de 10 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Guardar cambios del operador
   */
  const handleSave = async () => {
    // Si no hay cambios, solo cerrar
    if (!hasLocalChanges()) {
      navigation.goBack();
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validación', 'Por favor completa los campos requeridos correctamente');
      return;
    }

    setSaving(true);
    try {
      const updatedOperator = {
        name: name.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(), // String vacío si no ingresó (el servicio lo omite)
        password: password.trim(), // String vacío si no ingresó (el servicio lo omite, preservando la existente)
        position: Number(position),
      };

      await updateOperator(operator.dni, updatedOperator);
      Alert.alert('Éxito', 'Operador actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error actualizando operador:', error);
      const errorMessage = error?.message || '';
      
      // Capturar errores específicos de validación del backend
      if (errorMessage.includes('Ya existe un operador con DNI')) {
        setErrors(prevErrors => ({
          ...prevErrors,
          dni: 'Este DNI ya está registrado.',
        }));
      } else {
        Alert.alert('Error', errorMessage || 'No se pudo actualizar el operador');
      }
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
        <Text style={styles.title}>Editar Operador</Text>

        {/* DNI - READ ONLY */}
        <View style={styles.section}>
          <Text style={styles.label}>
            DNI <MaterialCommunityIcons name="lock" size={12} color="#dc3545" />
          </Text>
          <View style={[styles.input, styles.readOnlyInput]}>
            <Text style={styles.readOnlyText}>{dni}</Text>
          </View>
          <Text style={styles.readOnlyNote}>No puede ser modificado</Text>
        </View>

        {/* N° Legajo - READ ONLY */}
        <View style={styles.section}>
          <Text style={styles.label}>
            N° Legajo <MaterialCommunityIcons name="lock" size={12} color="#dc3545" />
          </Text>
          <View style={[styles.input, styles.readOnlyInput]}>
            <Text style={styles.readOnlyText}>{nLegajo}</Text>
          </View>
          <Text style={styles.readOnlyNote}>No puede ser modificado</Text>
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
          <Text style={styles.label}>Teléfono/Celular</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Máx 8 dígitos (opcional)"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={8}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* Contraseña - Opcional, si está vacía se preserva la contraseña actual */}
        <View style={styles.section}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.passwordInputContainer, errors.password && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Dejar vacío para mantener contraseña actual"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#428bc4"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
          <Text style={styles.optionalNote}>
            Si dejas vacío: se preservará la contraseña actual. Para cambiar: min 8 caracteres (mayúscula, minúscula, número)
          </Text>
        </View>

        {/* Cargo / Rol */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Cargo / Rol <Text style={styles.required}>*</Text>
          </Text>
          <PositionPicker
            value={position}
            onValueChange={setPosition}
            error={!!errors.position}
          />
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
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  readOnlyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
  },
  readOnlyNote: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
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
  passwordInputContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#212529',
    fontFamily: 'System',
  },
  passwordToggle: {
    padding: 8,
  },
  optionalNote: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  picker: {
    height: 56,
    fontSize: 14,
    color: '#212529',
  },
  pickerItem: {
    fontSize: 14,
    color: '#212529',
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

export default EditOperator;
