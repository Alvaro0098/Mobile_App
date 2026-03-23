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
import { getIncidences, deleteIncidence } from '../services/incidenceService';

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
 * 0: Iniciado (Gris)
 * 1: En progreso (Azul)
 * 2: Finalizado (Verde)
 */
const ESTADO_MAP = {
  0: { label: 'Iniciado', color: '#6c757d' },
  1: { label: 'En progreso', color: '#0d6efd' },
  2: { label: 'Finalizado', color: '#198754' },
};

const Incidence = ({ navigation }) => {
  const { tokenStatus, logout } = useAuth();
  const [incidences, setIncidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Cargar incidencias al montar el componente
  useEffect(() => {
    loadIncidences();
  }, []);

  /**
   * Recargar incidencias cuando la pantalla gana focus
   * (ej: al volver desde CreateIncidence)
   */
  useFocusEffect(
    useCallback(() => {
      loadIncidences();
    }, [])
  );

  /**
   * Cargar incidencias desde la API
   */
  const loadIncidences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIncidences();
      setIncidences(data || []);
    } catch (error) {
      console.error('Error cargando incidencias:', error);
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
      const data = await getIncidences();
      setIncidences(data || []);
    } catch (error) {
      console.error('Error refrescando incidencias:', error);
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
   * Manejar editar incidencia
   */
  const handleEdit = (incidence) => {
    navigation.navigate('EditIncidence', { incidence });
  };

  /**
   * Manejar eliminar incidencia con confirmación
   */
  const handleDelete = (incidence) => {
    Alert.alert(
      'Eliminar Incidencia',
      `¿Estás seguro que deseas eliminar la incidencia ID ${incidence.id}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIncidence(incidence.id);
              Alert.alert('Éxito', 'Incidencia eliminada correctamente');
              // Recargar la lista después de eliminar
              await onRefresh();
            } catch (error) {
              console.error('Error eliminando incidencia:', error);
              Alert.alert('Error', 'No se pudo eliminar la incidencia');
            }
          },
        },
      ]
    );
  };

  /**
   * Componente de Card para cada incidencia
   */
  const IncidenceCard = ({ item }) => {
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

        {/* Acciones (Editar / Eliminar) */}
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEdit(item)}
          >
            <MaterialIcons name="edit" size={18} color="#0d6efd" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={18} color="#dc3545" />
            <Text style={[styles.actionButtonText, { color: '#dc3545' }]}>
              Eliminar
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
      <MaterialIcons name="inbox" size={48} color="#ccc" />
      <Text style={styles.emptyText}>No hay incidencias registradas</Text>
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
          onPress={() => loadIncidences()}
        >
          <Text style={styles.retryButtonSecondaryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <TopBar />
      
      {error && renderAuthError()}
      {!error && loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#428bc4" />
        </View>
      ) : !error && (
        <FlatList
          data={incidences}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <IncidenceCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty()}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Floating Action Button */}
      {!error && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateIncidence')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={28} color="white" />
        </TouchableOpacity>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dateTypeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
  },
  typeText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  stateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stateBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#212529',
    minWidth: 80,
  },
  value: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d6efd',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#428bc4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  errorBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 12,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  debugBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Courier',
  },
  retryButton: {
    backgroundColor: '#428bc4',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButtonSecondary: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#428bc4',
  },
  retryButtonSecondaryText: {
    color: '#428bc4',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Incidence;
