import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  } catch (err) {
    console.error("Error login email/password:", err);
    return null;
  }
};

// Verifica si hay usuario logueado
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return !!data.user;
  } catch (err) {
    console.error("Error verificando autenticación:", err);
    return false;
  }
};

// Obtiene el usuario actual, o null si no hay
export const getUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (err) {
    console.error("Error obteniendo usuario:", err);
    return null;
  }
};

// Login con Google
export const loginWithGoogle = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL,
      },
    });
    if (error) throw error;
  } catch (err) {
    console.error("Error login Google:", err);
    throw err;
  }
};

/*

// Login con Facebook
export const loginWithFacebook = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL,
      },
    });
    if (error) throw error;
  } catch (err) {
    console.error("Error login Facebook:", err);
    throw err;
  }
};

// Login con Azure (Microsoft)
export const loginWithAzure = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL,
      },
    });
    if (error) throw error;
  } catch (err) {
    console.error("Error login Azure:", err);
    throw err;
  }
};

*/

// Logout
export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    console.error("Error cerrando sesión:", err);
    throw err;
  }
};