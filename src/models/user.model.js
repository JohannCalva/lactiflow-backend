import supabase from "../config/supabase.js";

export const getAllUsers = async () => {
  const { data, error } = await supabase.from("user").select("*");
  if (error) throw error;
  return data;
};

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const createUser = async (user) => {
  const { data, error } = await supabase
    .from("user")
    .insert([user])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateUser = async (id, user) => {
  const { data, error } = await supabase
    .from("user")
    .update(user)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteUser = async (id) => {
  const { error } = await supabase.from("user").delete().eq("id", id);
  if (error) throw error;
  return true;
};
