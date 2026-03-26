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
import { getAreas, deleteArea } from '../services/areaService';

const Area = ({ navigation }) => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAreas();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAreas();
    }, [])
  );

  const loadAreas = async () => {
    try {
      setLoading(true);
      const data = await getAreas();
      setAreas(data || []);
    } catch (error) {
      console.error('Error cargando áreas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getAreas();
      setAreas(data || []);
    } catch (error) {
      console.error('Error refrescando áreas:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEdit = (area) => {
    navigation.navigate('EditArea', { area });
  };

  const handleDelete = (area) => {
    Alert.alert(
      'Eliminar Área',
      `¿Estás seguro que deseas eliminar el área "${area.name}"?`,
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
              await deleteArea(area.id);
              Alert.alert('Éxito', 'Área eliminada correctamente');
              await onRefresh();
            } catch (error) {
              console.error('Error eliminando área:', error);
              Alert.alert('Error', error.message || 'No se pudo eliminar el área');
            }
          },
        },
      ]
    );
  };

  const AreaCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={24}
            color="#428bc4"
            style={styles.icon}
          />
          <Text style={styles.nameText}>{item.name}</Text>
        </View>

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

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="map" size={48} color="#ccc" />
      <Text style={styles.emptyText}>No hay áreas registradas</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar />
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#428bc4" />
        </View>
      ) : (
        <FlatList
          data={areas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <AreaCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty()}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateArea')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  icon: {
    marginRight: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
});

export default Area;