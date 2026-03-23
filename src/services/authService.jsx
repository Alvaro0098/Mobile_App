import { jwtDecode } from "jwt-decode"; // <--- NO OLVIDES ESTO

const API_URL = "http://192.168.100.107:5216/api/Authentication";

/**
 * Mapea el rol del servidor a un número de identificación
 */
const mapRoleToId = (rawRole) => {
    // Intentar sacar el rol si viene con la URL larga de Microsoft
    const role = rawRole ?? ""; 
    
    switch (role) {
        case "Admin": return 1;
        case "SysAdmin": return 2;
        case "Basic": return 0;
        default:
            return !isNaN(role) ? Number(role) : 0;
    }
};

export const loginService = async ({ nLegajo, password }) => {
    try {
        const response = await fetch(`${API_URL}/authenticate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ NLegajo: Number(nLegajo), Password: password }),
        });

        if (!response.ok) throw new Error("Credenciales inválidas");

        const token = await response.text();
        if (!token) return null;

        // USAMOS LA FUNCIÓN DE ABAJO QUE ES SEGURA PARA MOBILE
        const decoded = getUserData(token);

        if (decoded) {
            // Buscamos el claim de rol (a veces viene con la URL de schemas de Microsoft)
            const rawRole = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            
            return {
                token,
                name: decoded.given_name || "Usuario",
                familyName: decoded.family_name || "",
                role: mapRoleToId(rawRole),
                nLegajo: Number(nLegajo),
            };
        }
        return null;
    } catch (error) {
        console.error("Error en loginService:", error);
        throw error;
    }
};

export const getUserData = (token) => {
  try {
    return jwtDecode(token); // <--- Simple, limpio y no rompe en el celular
  } catch (error) {
    console.error("Error decodificando el token:", error);
    return null;
  }
};