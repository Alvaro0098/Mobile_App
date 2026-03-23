import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { loginService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

const LoginMobile = () => {
  const navigation = useNavigation();
  const { saveUserToStorage } = useAuth();
  const [nLegajo, setNLegajo] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Valida los campos de entrada
   */
  const validate = () => {
    const newErrors = {};

    if (!nLegajo.trim()) {
      newErrors.nLegajo = "El N° de Legajo es obligatorio.";
    } else if (isNaN(nLegajo) || Number(nLegajo) <= 0) {
      newErrors.nLegajo = "Ingrese un número de legajo válido.";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async () => {
    // Limpiar errores previos
    setErrors({});

    // Validar campos
    if (!validate()) {
      Alert.alert("Validación", "Por favor revisa los campos marcados en rojo.");
      return;
    }

    setLoading(true);

    try {
      const user = await loginService({
        nLegajo: nLegajo.trim(),
        password,
      });

      if (user && user.token) {
        // Guardar usuario y token en AsyncStorage y contexto
        const userData = {
          name: user.name,
          familyName: user.familyName,
          nLegajo: user.nLegajo,
          role: user.role,
        };

        await saveUserToStorage(userData, user.token);
        
        Alert.alert("Éxito", "Login exitoso");
        
        // Navegar a MainTabs (el cambio de isAuthenticated en el contexto también dispara el cambio)
        // navigation.navigate("MainTabs");
      } else {
        Alert.alert("Error", "No se pudieron obtener los datos del usuario.");
      }
    } catch (error) {
      Alert.alert("Error de Login", "Legajo o contraseña incorrectos. Por favor, verifique sus datos.");
      console.error("Error en login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Título */}
          <Text style={styles.title}>MuniTrack</Text>

          {/* Campo Legajo */}
          <View style={styles.fieldGroup}>
            <TextInput
              style={[
                styles.input,
                errors.nLegajo && styles.inputError,
              ]}
              placeholder="N° de Legajo"
              placeholderTextColor="#999"
              value={nLegajo}
              onChangeText={setNLegajo}
              keyboardType="numeric"
              editable={!loading}
            />
            {errors.nLegajo && (
              <Text style={styles.errorText}>{errors.nLegajo}</Text>
            )}
          </View>

          {/* Campo Contraseña */}
          <View style={styles.fieldGroup}>
            <TextInput
              style={[
                styles.input,
                errors.password && styles.inputError,
              ]}
              placeholder="Ingresar Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Checkbox Recordarme */}
          <View style={styles.checkboxContainer}>
            <Text style={styles.checkboxLabel}>Recordarme</Text>
          </View>

          {/* Botón Ingresar */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Link Olvidé mi Contraseña */}
          <TouchableOpacity style={styles.linkContainer}>
            <Text style={styles.linkText}>Olvidé mi Contraseña</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/**
 * Estilos nativos basados en Login.css y styles.css del proyecto desktop
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#428bc4", // Azul primario como fondo de login
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4, // Para Android
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#212529",
    marginBottom: 30,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#212529",
    backgroundColor: "#f8f9fa",
  },
  inputError: {
    borderColor: "#dc3545", // Color rojo para errores
    backgroundColor: "#fff5f5",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingLeft: 2,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#212529",
  },
  button: {
    backgroundColor: "#08a18e", // Teal oscuro como en desktop
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  linkContainer: {
    alignItems: "flex-end",
    paddingRight: 4,
  },
  linkText: {
    color: "#0066cc", // Azul para links
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default LoginMobile;
