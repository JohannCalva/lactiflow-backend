import supabase from "../config/supabase.js";

export const getAllDeliveries = async () => {
  // En el select indicamos que aparte de los datos de delivery, nos traiga la info
  // de las tablas relacionadas (client, product y user) para no hacer consultas extra
  const { data, error } = await supabase
    .from("delivery")
    .select("*, client(*), product(*), user(*)");
  if (error) throw error;
  return data;
};

export const getDeliveryById = async (id) => {
  const { data, error } = await supabase
    .from("delivery")
    .select("*, client(*), product(*), user(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createDelivery = async (delivery) => {
  const { data, error } = await supabase
    .from("delivery")
    .insert([delivery])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateDelivery = async (id, delivery) => {
  const { data, error } = await supabase
    .from("delivery")
    .update(delivery)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteDelivery = async (id) => {
  const { error } = await supabase.from("delivery").delete().eq("id", id);
  if (error) throw error;
  return true;
};
