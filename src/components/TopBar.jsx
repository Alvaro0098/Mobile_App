import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const TopBar = () => {
  const { user, logout } = useAuth();

  /**
   * Mapear role a nombre legible
   */
  const getRoleName = (role) => {
    switch (role) {
      case 0:
        return 'Operador';
      case 1:
        return 'Administrador';
      case 2:
        return 'SysAdmin';
      default:
        return 'Usuario';
    }
  };

  /**
   * Manejar el cierre de sesión
   * IMPORTANTE: No necesita navigation.navigate('Login') porque el cambio de
   * isAuthenticated en el contexto automáticamente causa que RootNavigator
   * renderice el Login. TopBar ya se desmontará del árbol cuando logout() cambie isAuthenticated.
   */
  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            await logout(); // Solo ejecutar logout, la navegación es automática
          },
          style: 'destructive',
        },
      ]
    );
  };

  const userName = user?.name || 'Usuario';
  const userRole = user ? getRoleName(user.role) : 'Sin Rol';

  return (
    <SafeAreaView style={styles.topBarWrapper}>
      <View style={styles.topBarContainer}>
        {/* Centro: Título */}
        <Text style={styles.title}>munitrack</Text>

        {/* Lado Derecho: Perfil, Usuario e Icono Logout */}
        <View style={styles.profileContainer}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>{userRole}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <MaterialIcons name="logout" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topBarWrapper: {
    backgroundColor: '#428bc4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  topBarContainer: {
    height: 60,
    backgroundColor: '#428bc4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  userRole: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});

export default TopBar;