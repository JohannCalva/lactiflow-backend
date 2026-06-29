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

export const getHistoryByClientInWindow = async (
  clientId,
  productId,
  windowDays = 60,
) => {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - windowDays);
  const sinceStr = since.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("delivery")
    .select("delivered_at, quantity")
    .eq("client_id", clientId)
    .eq("product_id", productId)
    .gte("delivered_at", sinceStr)
    .order("delivered_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const getHistoryByClient = async (clientId, productId) => {
  const { data, error } = await supabase
    .from("delivery")
    .select("delivered_at, day_of_week, quantity")
    .eq("client_id", clientId)
    .eq("product_id", productId)
    .order("delivered_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const getDistinctProductIdsForClient = async (clientId) => {
  const { data, error } = await supabase
    .from("delivery")
    .select("product_id")
    .eq("client_id", clientId);

  if (error) throw error;

  return [...new Set((data || []).map((d) => d.product_id))];
};
