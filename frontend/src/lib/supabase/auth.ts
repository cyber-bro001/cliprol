import { supabase } from "./supabaseClient";
import type { AuthResult, userCrediantailsType } from "../../types";

//SIGNUP WITH EMAIL, PASSWORD, AND NAME
export const signUpWithEmail = async ({
  email,
  password,
  name,
}: userCrediantailsType): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
        },
      },
    });
    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error signing up:", error);
    return { success: false, error };
  }
};

//SIGNIN WITH EMAIL AND PASSWORD
export const signInWithEmail = async ({
  email,
  password,
}: userCrediantailsType): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error signing in:", error);
    return { success: false, error };
  }
};

//SIGNOUT
export const signOut = async (): Promise<AuthResult> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, error };
  }
  return { success: true };
};
