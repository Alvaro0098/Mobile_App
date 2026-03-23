import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            await logout();
            // Navegar de vuelta a Login
            navigation.navigate('Login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Mapear role a nombre legible
  const getRoleName = (role) => {
    switch (role) {
      case 0:
        return 'Basico';
      case 1:
        return 'Admin';
      case 2:
        return 'SysAdmin';
      default:
        return 'Desconocido';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Bienvenido</Text>
        
        {user && (
          <>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Legajo:</Text>
              <Text style={styles.infoValue}>{user.nLegajo}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Rol:</Text>
              <Text style={styles.infoValue}>{getRoleName(user.role)}</Text>
            </View>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>MuniTrack - Sistema de Gestión Municipal</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#428bc4',
    textAlign: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginTop: 40,
  },
});

export default Home;
