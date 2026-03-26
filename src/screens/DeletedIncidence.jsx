import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { useAuth } from '../hooks/useAuth';
import { getDeletedIncidences, restoreIncidence } from '../services/incidenceService';

/**
 * Mapeo de tipos de incidencia
 */
const TIPO_MAP = {
  0: 'Chapas',
  1: 'Bolsón',
  2: 'Reclamo',
  3: 'Licencia',
  4: 'Trámite',
  5: 'Otros',
};

/**
 * Mapeo de estados con colores
 */
const ESTADO_MAP = {
  0: { label: 'Iniciado', color: '#6c757d' },
  1: { label: 'En progreso', color: '#0d6efd' },
  2: { label: 'Finalizado', color: '#198754' },
};

const DeletedIncidence = ({ navigation }) => {
  const { tokenStatus, logout } = useAuth();
  const [incidences, setIncidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Cargar incidencias eliminadas al montar el componente
  useEffect(() => {
    loadDeletedIncidences();
  }, []);

  /**
   * Recargar incidencias eliminadas cuando la pantalla gana focus
   */
  useFocusEffect(
    useCallback(() => {
      loadDeletedIncidences();
    }, [])
  );

  /**
   * Cargar incidencias eliminadas desde la API
   */
  const loadDeletedIncidences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDeletedIncidences();
      setIncidences(data || []);
    } catch (error) {
      console.error('Error cargando incidencias eliminadas:', error);
      const errorMessage = error.message || 'Error desconocido';

      // Si es error 401, mostrar mensaje específico
      if (errorMessage.includes('401')) {
        setError('🔓 No autenticado: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else {
        setError(`❌ Error: ${errorMessage}`);
      }
      setIncidences([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar el pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const data = await getDeletedIncidences();
      setIncidences(data || []);
    } catch (error) {
      console.error('Error refrescando incidencias eliminadas:', error);
      const errorMessage = error.message || 'Error desconocido';

      if (errorMessage.includes('401')) {
        setError('🔓 No autenticado: Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else {
        setError(`❌ Error: ${errorMessage}`);
      }
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Formato de fecha en español
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Manejar restaurar incidencia con confirmación
   */
  const handleRestore = (incidence) => {
    const operatorName =
      incidence.operator && incidence.operator.name
        ? `${incidence.operator.name} ${incidence.operator.lastName || ''}`
        : `Operador ID: ${incidence.operatorId}`;

    Alert.alert(
      '¿Restaurar Incidencia?',
      `Se restaurará la incidencia con ID: ${incidence.id}\nOperador responsable: ${operatorName}`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, restaurar',
          style: 'default',
          onPress: async () => {
            try {
              await restoreIncidence(incidence.id);
              Alert.alert('Éxito', '¡Incidencia restaurada exitosamente!');
              // Recargar la lista después de restaurar
              await onRefresh();
            } catch (error) {
              console.error('Error restaurando incidencia:', error);
              Alert.alert('Error', error.message || 'No se pudo restaurar la incidencia');
            }
          },
        },
      ]
    );
  };

  /**
   * Componente de Card para cada incidencia eliminada
   */
  const DeletedIncidenceCard = ({ item }) => {
    const estadoInfo = ESTADO_MAP[item.state];
    const tipoLabel = TIPO_MAP[item.incidenceType] || `Tipo ${item.incidenceType}`;
    const areaName = item.area?.name || `Área ID: ${item.areaId}`;
    const operatorName =
      item.operator && item.operator.name
        ? `${item.operator.name} ${item.operator.lastName || ''}`
        : `Operador ID: ${item.operatorId}`;

    return (
      <View style={styles.card}>
        {/* Header: Fecha y Tipo */}
        <View style={styles.cardHeader}>
          <View style={styles.dateTypeContainer}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            <Text style={styles.typeText}>• {tipoLabel}</Text>
          </View>
          {/* Badge de Estado */}
          <View
            style={[
              styles.stateBadge,
              { backgroundColor: estadoInfo.color },
            ]}
          >
            <Text style={styles.stateBadgeText}>{estadoInfo.label}</Text>
          </View>
        </View>

        {/* Área */}
        <View style={styles.cardRow}>
          <Text style={styles.label}>Área:</Text>
          <Text style={styles.value}>{areaName}</Text>
        </View>

        {/* Descripción */}
        <View style={styles.cardRow}>
          <Text style={styles.label}>Descripción:</Text>
          <Text style={[styles.value, { flex: 1 }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        {/* Operador */}
        <View style={styles.cardRow}>
          <Text style={styles.label}>Operador:</Text>
          <Text style={styles.value}>{operatorName}</Text>
        </View>

        {/* Acciones (Restaurar) */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.restoreButton]}
            onPress={() => handleRestore(item)}
          >
            <MaterialCommunityIcons name="restore" size={18} color="#198754" />
            <Text style={[styles.actionButtonText, { color: '#198754' }]}>
              Restaurar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Renderizar lista vacía
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="trash-can-outline" size={48} color="#ccc" />
      <Text style={styles.emptyText}>No hay incidencias eliminadas</Text>
    </View>
  );

  /**
   * Renderizar error de autenticación
   */
  const renderAuthError = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.errorContainer}>
      <TopBar />
      <View style={styles.errorBox}>
        <MaterialIcons name="lock" size={56} color="#dc3545" />
        <Text style={styles.errorTitle}>Error de Autenticación</Text>
        <Text style={styles.errorMessage}>{error}</Text>

        {tokenStatus.error && (
          <View style={styles.debugBox}>
            <Text style={styles.debugTitle}>🔍 Información de Debug:</Text>
            <Text style={styles.debugText}>• Token: {tokenStatus.hasToken ? '✅ Presente' : '❌ No encontrado'}</Text>
            <Text style={styles.debugText}>• Válido: {tokenStatus.isValid ? '✅ Sí' : '❌ No'}</Text>
            <Text style={styles.debugText}>• Expirado: {tokenStatus.isExpired ? '⏰ Sí' : '❌ No'}</Text>
            <Text style={styles.debugText}>• Error: {tokenStatus.error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => logout()}
        >
          <Text style={styles.retryButtonText}>Ir a Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.retryButtonSecondary}
          onPress={() => loadDeletedIncidences()}
        >
          <Text style={styles.retryButtonSecondaryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <TopBar />

      {/* Header personalizado */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#428bc4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incidencias Eliminadas</Text>
        <View style={{ width: 40 }} />
      </View>

      {error && renderAuthError()}
      {!error && loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#428bc4" />
        </View>
      ) : !error && (
        <FlatList
          data={incidences}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <DeletedIncidenceCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  typeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  stateBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginRight: 8,
    minWidth: 70,
  },
  value: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  restoreButton: {
    borderColor: '#198754',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0d6efd',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorBox: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    color: '#dc3545',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  debugBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#dc3545',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  retryButtonSecondary: {
    borderWidth: 1,
    borderColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonSecondaryText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default DeletedIncidence;
