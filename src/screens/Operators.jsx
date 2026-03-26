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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { getOperators, deleteOperator } from '../services/operatorService';

const Operators = ({ navigation }) => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOperators();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOperators();
    }, [])
  );

  const loadOperators = async () => {
    try {
      setLoading(true);
      const data = await getOperators();
      setOperators(data || []);
    } catch (error) {
      console.error('Error cargando operadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getOperators();
      setOperators(data || []);
    } catch (error) {
      console.error('Error refrescando operadores:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEdit = (operator) => {
    navigation.navigate('EditOperator', { operator });
  };

  /**
   * Manejar eliminar operador con confirmación
   */
  const handleDelete = (operator) => {
    Alert.alert(
      'Eliminar Operador',
      `¿Estás seguro que deseas eliminar a ${operator.name} ${operator.lastName}?`,
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
              // El backend espera el DNI (camelCase: dni) en la URL
              // DELETE /api/Operator/{dni}
              await deleteOperator(operator.dni);
              Alert.alert('Éxito', 'Operador eliminado correctamente');
              // Recargar la lista después de eliminar
              await onRefresh();
            } catch (error) {
              console.error('Error eliminando operador:', error);
              Alert.alert('Error', error.message || 'No se pudo eliminar el operador');
            }
          },
        },
      ]
    );
  };

  /**
   * Componente de Card para cada operador
   */
  const OperatorCard = ({ item }) => {
    const fullName = `${item.name} ${item.lastName}`;
    const nLegajo = item.nLegajo || item.NLegajo || 'N/A';
    const email = item.email || 'No especificado';
    const position = item.position || item.Position || 'Sin especificar';

    return (
      <View style={styles.card}>
        {/* Header: Nombre completo */}
        <View style={styles.cardHeader}>
          <Text style={styles.nameText}>{fullName}</Text>
        </View>

        {/* Detalle 1: DNI */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="id-card" size={18} color="#666" />
          <Text style={styles.detailLabel}>DNI:</Text>
          <Text style={styles.detailValue}>{item.dni}</Text>
        </View>

        {/* Detalle 2: N° de Legajo */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="file-document" size={18} color="#666" />
          <Text style={styles.detailLabel}>N° Legajo:</Text>
          <Text style={styles.detailValue}>{nLegajo}</Text>
        </View>

        {/* Detalle 3: Email */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="email" size={18} color="#666" />
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{email}</Text>
        </View>

        {/* Detalle 4: Cargo */}
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="briefcase" size={18} color="#666" />
          <Text style={styles.detailLabel}>Cargo:</Text>
          <View style={[styles.positionBadge, { backgroundColor: getPositionColor(position) }]}>
            <Text style={styles.positionText}>{position}</Text>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item)}
          >
            <MaterialIcons name="edit" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={20} color="#DC3545" />
            <Text style={[styles.actionText, { color: '#DC3545' }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getPositionColor = (position) => {
    switch (position?.toLowerCase()) {
      case 'sysadmin':
        return '#DC3545';
      case 'admin':
        return '#FFC107';
      default:
        return '#17A2B8';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#428bc4" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />
      <FlatList
        data={operators}
        renderItem={({ item }) => <OperatorCard item={item} />}
        keyExtractor={(item) => item.dni.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyMessage={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay operadores</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 8,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  positionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#e7f3ff',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#ffe7e7',
  },
  actionText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default Operators;
