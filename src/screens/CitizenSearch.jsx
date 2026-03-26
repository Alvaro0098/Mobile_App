import React, { useState } from 'react';
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
import { getCitizenByDni } from '../services/CitizenService';

const CitizenSearch = ({ navigation }) => {
  const [dni, setDni] = useState('');
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Manejo de cambio de DNI
   * Bloquea más de 8 dígitos y limpia resultado anterior
   */
  const handleDniChange = (value) => {
    if (value.length <= 8) {
      setDni(value);
      // Limpiar resultado anterior cuando modifica el input
      setCitizen(null);
      setError(null);
    }
  };

  /**
   * Limpiar completamente la búsqueda
   */
  const handleClear = () => {
    setDni('');
    setCitizen(null);
    setError(null);
    setLoading(false);
  };

  /**
   * Buscar ciudadano por DNI
   */
  const handleSearch = async () => {
    // Validación mínima
    if (dni.length < 6) {
      setError('El DNI debe tener al menos 6 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);
    setCitizen(null);

    try {
      const data = await getCitizenByDni(dni);
      if (data) {
        setCitizen(data);
      } else {
        setError(`No se encontró ningún ciudadano con el DNI: ${dni}`);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al conectar con el servidor. Verifique su conexión.');
    } finally {
      setLoading(false);
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
        {/* Botón Volver */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#428bc4" />
          <Text style={styles.backButtonText}>Volver a Ciudadanos</Text>
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.title}>Buscador de Ciudadanos</Text>

        {/* Formulario de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ej: 46502865"
              keyboardType="number-pad"
              value={dni}
              onChangeText={handleDniChange}
              maxLength={8}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.searchBtn, loading || dni.length < 6 ? styles.disabled : null]}
              onPress={handleSearch}
              disabled={loading || dni.length < 6}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialCommunityIcons name="magnify" size={20} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.clearBtn,
                loading || (dni === '' && !citizen && !error) ? styles.disabled : null,
              ]}
              onPress={handleClear}
              disabled={loading || (dni === '' && !citizen && !error)}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#6c757d" />
            </TouchableOpacity>
          </View>

          {/* Indicador de longitud */}
          <View style={styles.lengthIndicator}>
            <Text style={[styles.lengthText, dni.length >= 6 ? styles.lengthValid : null]}>
              {dni.length} / 8 dígitos
            </Text>
          </View>
        </View>

        {/* Mensajes de error */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#dc3545" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Resultado de la búsqueda */}
        {citizen && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Ciudadano Encontrado</Text>
            </View>

            <View style={styles.resultBody}>
              {/* DN */}
              <View style={styles.resultRow}>
                <MaterialCommunityIcons
                  name="account-card-details"
                  size={20}
                  color="#428bc4"
                  style={styles.resultIcon}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>DNI / Documento</Text>
                  <Text style={styles.resultValue}>{citizen.dni}</Text>
                </View>
              </View>

              {/* Nombre Completo */}
              <View style={styles.resultRow}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color="#428bc4"
                  style={styles.resultIcon}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Nombre Completo</Text>
                  <Text style={styles.resultValue}>
                    {citizen.name} {citizen.lastName}
                  </Text>
                </View>
              </View>

              {/* Dirección */}
              <View style={styles.resultRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color="#428bc4"
                  style={styles.resultIcon}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Dirección</Text>
                  <Text style={styles.resultValue}>{citizen.adress}</Text>
                </View>
              </View>

              {/* Teléfono */}
              <View style={styles.resultRow}>
                <MaterialCommunityIcons
                  name="phone"
                  size={20}
                  color="#428bc4"
                  style={styles.resultIcon}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Teléfono</Text>
                  <Text style={styles.resultValue}>{citizen.phone}</Text>
                </View>
              </View>

              {/* Email */}
              <View style={styles.resultRow}>
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color="#428bc4"
                  style={styles.resultIcon}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultLabel}>Email</Text>
                  <Text style={styles.resultValue}>{citizen.email}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
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
    paddingVertical: 12,
    paddingBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#428bc4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    color: '#212529',
  },
  searchBtn: {
    backgroundColor: '#428bc4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabled: {
    opacity: 0.5,
  },
  lengthIndicator: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  lengthText: {
    fontSize: 12,
    color: '#999',
  },
  lengthValid: {
    color: '#28a745',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
    flex: 1,
  },
  resultContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    backgroundColor: '#428bc4',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  resultBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resultIcon: {
    marginTop: 2,
  },
  resultInfo: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
});

export default CitizenSearch;
