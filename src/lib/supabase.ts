import { createClient } from "@supabase/supabase-js";

// Leer variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación simple para evitar errores en runtime
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas. " +
    "Revisá tu archivo .env o las variables de entorno en Vercel."
  );
}

// Crear cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Logout seguro
export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    console.error("Error cerrando sesión:", err);
  }
};

// Login simulado para actualizar usuario localmente (no hace login real)
export const loginUser = async (userData: any): Promise<void> => {
  console.log("loginUser llamado con:", userData);
};