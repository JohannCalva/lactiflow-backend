import supabase from "../config/supabase.js";

export const getSuggestionsByDate = async (date) => {
  const { data, error } = await supabase
    .from("suggestion")
    .select(
      "*, client(id, name, client_type, business_type(name)), product(id, name)",
    )
    .eq("next_date", date)
    .order("client_id", { ascending: true });

  if (error) throw error;
  return data;
};

export const getAllSuggestions = async () => {
  const { data, error } = await supabase
    .from("suggestion")
    .select(
      "*, client(id, name, client_type, business_type(name)), product(id, name)",
    )
    .order("next_date", { ascending: true })
    .order("client_id", { ascending: true });

  if (error) throw error;
  return data;
};

export const getSuggestionsByRange = async (startDate, endDate) => {
  const { data, error } = await supabase
    .from("suggestion")
    .select(
      "*, client(id, name, client_type, business_type(name)), product(id, name)",
    )
    .gte("next_date", startDate)
    .lte("next_date", endDate)
    .order("next_date", { ascending: true })
    .order("client_id", { ascending: true });

  if (error) throw error;
  return data;
};

export const getProductTotalsByDate = async (date) => {
  // Fetch suggestions for the date with product info and suggested_qty
  const { data, error } = await supabase
    .from("suggestion")
    .select("product(id, name), suggested_qty")
    .eq("next_date", date);

  if (error) throw error;

  // Aggregate totals per product in JS
  const totals = new Map();
  for (const row of data) {
    const product = row.product || {};
    const productId = product.id || null;
    const productName = product.name || null;
    const qty = Number(row.suggested_qty) || 0;

    if (!productId) continue;

    if (!totals.has(productId)) {
      totals.set(productId, {
        product_id: productId,
        product_name: productName,
        total_qty: 0,
      });
    }

    const entry = totals.get(productId);
    entry.total_qty += qty;
  }

  // Convert to array and round totals if desired
  return Array.from(totals.values()).map((t) => ({
    product_id: t.product_id,
    product_name: t.product_name,
    total_qty: Math.round(t.total_qty * 100) / 100,
  }));
};
