import supabase from "../config/supabase.js";

// Hacemos un select general de toda la tabla
export const getAllBusinessTypes = async () => {
  const { data, error } = await supabase.from("business_type").select("*");
  if (error) throw error;
  return data; // Retornamos los datos al controlador
};

// Buscamos un registro especifico usando su id
export const getBusinessTypeById = async (id) => {
  const { data, error } = await supabase
    .from("business_type")
    .select("*")
    .eq("id", id) // "eq" es equals (donde id sea igual al que me pasan)
    .single(); // Para que me devuelva el objeto directo y no un arreglo de un solo elemento
  if (error) throw error;
  return data;
};

// Insertamos un nuevo dato pasando el objeto y devolvemos lo insertado
export const createBusinessType = async (businessType) => {
  const { data, error } = await supabase
    .from("business_type")
    .insert([businessType])
    .select() // Forzamos a que nos devuelva el objeto recien creado
    .single();
  if (error) throw error;
  return data;
};

// Actualizamos haciendo match por el id
export const updateBusinessType = async (id, businessType) => {
  const { data, error } = await supabase
    .from("business_type")
    .update(businessType)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Eliminamos de la base de datos
export const deleteBusinessType = async (id) => {
  const { error } = await supabase.from("business_type").delete().eq("id", id);
  if (error) throw error;
  return true;
};
