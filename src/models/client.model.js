import supabase from "../config/supabase.js";

export const getAllClients = async () => {
  const { data, error } = await supabase
    .from("client")
    .select("*, business_type(*)");
  if (error) throw error;
  return data;
};

export const getClientById = async (id) => {
  const { data, error } = await supabase
    .from("client")
    .select("*, business_type(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createClient = async (client) => {
  const { data, error } = await supabase
    .from("client")
    .insert([client])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateClient = async (id, client) => {
  const { data, error } = await supabase
    .from("client")
    .update(client)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteClient = async (id) => {
  const { error } = await supabase.from("client").delete().eq("id", id);
  if (error) throw error;
  return true;
};
