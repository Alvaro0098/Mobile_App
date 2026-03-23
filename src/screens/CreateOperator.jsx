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
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { createOperator } from '../services/operatorService';

const CreateOperator = ({ navigation }) => {
  // Form state
  const [dni, setDni] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nLegajo, setNLegajo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('0'); // 0=OperatorBasic, 1=Admin, 2=SysAdmin

  // UI state
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Validar formulario según reglas del backend
   */
  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // DNI
    if (!dni || dni.trim().length === 0) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (dni.trim().length > 8) {
      newErrors.dni = 'El DNI no puede superar 8 dígitos';
    } else if (isNaN(dni)) {
      newErrors.dni = 'El DNI debe ser numérico';
    }

    // Name
    if (!name || name.trim().length === 0) {
      newErrors.name = 'El nombre es obligatorio';
    }

    // LastName
    if (!lastName || lastName.trim().length === 0) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    // NLegajo
    if (!nLegajo || nLegajo.trim().length === 0) {
      newErrors.nLegajo = 'El N° de Legajo es obligatorio';
    } else if (nLegajo.trim().length < 4) {
      newErrors.nLegajo = 'El legajo debe tener al menos 4 dígitos';
    } else if (isNaN(nLegajo)) {
      newErrors.nLegajo = 'El legajo debe ser numérico';
    }

    // Email
    if (!email || email.trim().length === 0) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El formato de email es inválido';
    }

    // Password - Solo validar en CREATE
    if (!password || password.trim().length === 0) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Min 8 caracteres (mayúscula, minúscula, número)';
    }

    // Phone (opcional pero validar si se proporciona)
    if (phone && phone.length > 8) {
      newErrors.phone = 'El celular no puede tener más de 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Guardar operador
   */
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validación', 'Por favor completa los campos requeridos correctamente');
      return;
    }

    setSaving(true);
    try {
      const newOperator = {
        dni: Number(dni.trim()),
        name: name.trim(),
        lastName: lastName.trim(),
        nLegajo: Number(nLegajo.trim()),
        email: email.trim(),
        phone: phone.trim() || null,
        password: password.trim(),
        position: Number(position),
      };

      await createOperator(newOperator);
      Alert.alert('Éxito', 'Operador creado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error creando operador:', error);
      Alert.alert('Error', 'No se pudo crear el operador');
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
        <Text style={styles.title}>Registrar Nuevo Operador</Text>

        {/* DNI */}
        <View style={styles.section}>
          <Text style={styles.label}>
            DNI <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.dni && styles.inputError]}
            placeholder="Número de DNI (máx 8 dígitos)"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={dni}
            onChangeText={setDni}
            maxLength={8}
          />
          {errors.dni && <Text style={styles.errorText}>{errors.dni}</Text>}
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

        {/* N° Legajo */}
        <View style={styles.section}>
          <Text style={styles.label}>
            N° Legajo <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.nLegajo && styles.inputError]}
            placeholder="Número de legajo (mín 4 dígitos)"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={nLegajo}
            onChangeText={setNLegajo}
          />
          {errors.nLegajo && (
            <Text style={styles.errorText}>{errors.nLegajo}</Text>
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

        {/* Contraseña */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Contraseña <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.passwordInputContainer, errors.password && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Min 8 caracteres (mayús, minús, número)"
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
        </View>

        {/* Cargo / Rol */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Cargo / Rol <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.pickerContainer, errors.position && styles.inputError]}>
            <Picker
              selectedValue={position}
              onValueChange={(itemValue) => setPosition(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Operador Básico" value="0" />
              <Picker.Item label="Admin" value="1" />
              <Picker.Item label="SysAdmin" value="2" />
            </Picker>
          </View>
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
              <Text style={styles.saveButtonText}>Guardar</Text>
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
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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

export default CreateOperator;
