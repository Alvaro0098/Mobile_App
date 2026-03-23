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
import { getCitizens, deleteCitizen } from '../services/CitizenService';

const Citizen = ({ navigation }) => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar ciudadanos al montar el componente
  useEffect(() => {
    loadCitizens();
  }, []);

  /**
   * Recargar ciudadanos cuando la pantalla gana focus
   * (ej: al volver desde CreateCitizen o EditCitizen)
   */
  useFocusEffect(
    useCallback(() => {
      loadCitizens();
    }, [])
  );

  /**
   * Cargar ciudadanos desde la API
   */
  const loadCitizens = async () => {
    try {
      setLoading(true);
      const data = await getCitizens();
      setCitizens(data || []);
    } catch (error) {
      console.error('Error cargando ciudadanos:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar el pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getCitizens();
      setCitizens(data || []);
    } catch (error) {
      console.error('Error refrescando ciudadanos:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Manejar editar ciudadano
   */
  const handleEdit = (citizen) => {
    navigation.navigate('EditCitizen', { citizen });
  };

  /**
   * Manejar eliminar ciudadano con confirmación
   */
  const handleDelete = (citizen) => {
    Alert.alert(
      'Eliminar Ciudadano',
      `¿Estás seguro que deseas eliminar a ${citizen.name} ${citizen.lastName}?`,
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
              await deleteCitizen(citizen.dni);
              Alert.alert('Éxito', 'Ciudadano eliminado correctamente');
              // Recargar la lista después de eliminar
              await onRefresh();
            } catch (error) {
              console.error('Error eliminando ciudadano:', error);
              Alert.alert('Error', 'No se pudo eliminar el ciudadano');
            }
          },
        },
      ]
    );
  };

  /**
   * Componente de Card para cada ciudadano
   */
  const CitizenCard = ({ item }) => {
    const fullName = `${item.name} ${item.lastName}`;

    return (
      <View style={styles.card}>
        {/* Header: Nombre completo */}
        <View style={styles.cardHeader}>
          <Text style={styles.nameText}>{fullName}</Text>
        </View>

        {/* DNI */}
        <View style={styles.cardRow}>
          <MaterialCommunityIcons
            name="account-card-details"
            size={16}
            color="#428bc4"
            style={styles.icon}
          />
          <Text style={styles.label}>DNI:</Text>
          <Text style={styles.value}>{item.dni}</Text>
        </View>

        {/* Email */}
        <View style={styles.cardRow}>
          <MaterialCommunityIcons
            name="email"
            size={16}
            color="#428bc4"
            style={styles.icon}
          />
          <Text style={styles.label}>Email:</Text>
          <Text style={[styles.value, { flex: 1 }]} numberOfLines={1}>
            {item.email || 'No especificado'}
          </Text>
        </View>

        {/* Teléfono */}
        <View style={styles.cardRow}>
          <MaterialCommunityIcons
            name="phone"
            size={16}
            color="#428bc4"
            style={styles.icon}
          />
          <Text style={styles.label}>Tel:</Text>
          <Text style={styles.value}>{item.phone || 'No especificado'}</Text>
        </View>

        {/* Dirección */}
        <View style={styles.cardRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color="#428bc4"
            style={styles.icon}
          />
          <Text style={styles.label}>Dir:</Text>
          <Text style={[styles.value, { flex: 1 }]} numberOfLines={1}>
            {item.adress || 'No especificado'}
          </Text>
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
      <MaterialIcons name="people" size={48} color="#ccc" />
      <Text style={styles.emptyText}>No hay ciudadanos registrados</Text>
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
          data={citizens}
          keyExtractor={(item) => item.dni}
          renderItem={({ item }) => <CitizenCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty()}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateCitizen')}
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
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
    width: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#212529',
    minWidth: 50,
  },
  value: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
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
});

export default Citizen;
