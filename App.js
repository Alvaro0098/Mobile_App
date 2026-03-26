import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importar contexto
import { AuthProvider } from './src/context/authContext';
import { useAuth } from './src/hooks/useAuth';

// Importar pantallas
import LoginMobile from './src/screens/LoginMobile';
import Incidence from './src/screens/Incidence';
import CreateIncidence from './src/screens/CreateIncidence';
import EditIncidence from './src/screens/EditIncidence';
import Citizen from './src/screens/Citizen';
import CreateCitizen from './src/screens/CreateCitizen';
import EditCitizen from './src/screens/EditCitizen';
import CitizenSearch from './src/screens/CitizenSearch';
import Area from './src/screens/Area';
import CreateArea from './src/screens/CreateArea';
import EditArea from './src/screens/EditArea';
import Operators from './src/screens/Operators';
import CreateOperator from './src/screens/CreateOperator';
import EditOperator from './src/screens/EditOperator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Stack de Incidencias: permite navegar entre lista, crear y editar
 */
function IncidenceStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="IncidenceList"
        component={Incidence}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="CreateIncidence"
        component={CreateIncidence}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="EditIncidence"
        component={EditIncidence}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Stack de Ciudadanos: permite navegar entre lista, crear, editar y buscar
 */
function CitizenStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="CitizenList"
        component={Citizen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="CreateCitizen"
        component={CreateCitizen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="EditCitizen"
        component={EditCitizen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="CitizenSearch"
        component={CitizenSearch}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Stack de Áreas: permite navegar entre lista, crear y editar
 */
function AreaStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AreaList"
        component={Area}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="CreateArea"
        component={CreateArea}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="EditArea"
        component={EditArea}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Stack de Operadores: permite navegar entre lista, crear y editar
 */
function OperatorStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="OperatorList"
        component={Operators}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="CreateOperator"
        component={CreateOperator}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="EditOperator"
        component={EditOperator}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * TabNavigator: Navegación por pestañas en la parte inferior
 */
function TabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#428bc4',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -5,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Incidencias"
        component={IncidenceStackNavigator}
        options={{
          tabBarLabel: 'Incidencias',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Ciudadanos"
        component={CitizenStackNavigator}
        options={{
          tabBarLabel: 'Ciudadanos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Áreas"
        component={AreaStackNavigator}
        options={{
          tabBarLabel: 'Áreas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Operadores"
        component={OperatorStackNavigator}
        options={{
          tabBarLabel: 'Operadores',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-tie" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * RootNavigator: Cambia entre Login y TabNavigation basado en autenticación
 */
function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        // Stack de Login (sin HeaderBar)
        <Stack.Group screenOptions={{ animationEnabled: false }}>
          <Stack.Screen
            name="Login"
            component={LoginMobile}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Group>
      ) : (
        // Tab Navigator after Login
        <Stack.Group screenOptions={{ animationEnabled: false }}>
          <Stack.Screen
            name="MainTabs"
            component={TabNavigation}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
