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

export const getActiveClients = async (filterClientId = null) => {
  let query = supabase.from("client").select("*").eq("is_active", true);
  if (filterClientId) {
    query = query.eq("id", filterClientId);
  }
  const { data, error } = await query;
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

export const getClientProfile = async (clientId) => {
  // 1. Datos base del cliente con su tipo de negocio
  const { data: client, error: clientError } = await supabase
    .from("client")
    .select(
      `
      id,
      name,
      client_type,
      phone,
      address,
      is_active,
      business_type (name)
    `,
    )
    .eq("id", clientId)
    .single();

  if (clientError) throw clientError;
  if (!client) return null;

  // 2. Todas las entregas de este cliente para calcular stats
  const { data: deliveries, error: deliveriesError } = await supabase
    .from("delivery")
    .select("delivered_at, quantity, product_id, product(name), notes")
    .eq("client_id", clientId)
    .order("delivered_at", { ascending: false });

  if (deliveriesError) throw deliveriesError;

  // 3. Calcular estadísticas
  const totalDeliveries = deliveries.length;
  const lastDelivery = deliveries[0] ?? null;

  const daysSinceLast = lastDelivery
    ? Math.floor(
        (new Date() - new Date(lastDelivery.delivered_at)) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const inactiveAlert = daysSinceLast !== null && daysSinceLast > 21;

  // Día más frecuente de compra
  const dayCounts = {};
  deliveries.forEach((d) => {
    const day = new Date(d.delivered_at).toLocaleDateString("es-EC", {
      weekday: "long",
    });
    dayCounts[day] = (dayCounts[day] ?? 0) + 1;
  });
  const mostCommonDay =
    Object.keys(dayCounts).length > 0
      ? Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  // 4. Resumen agrupado por producto
  const productMap = {};
  deliveries.forEach((d) => {
    const pid = d.product_id;
    if (!productMap[pid]) {
      productMap[pid] = {
        product_name: d.product?.name ?? "Desconocido",
        quantities: [],
        last_quantity: null,
        total_deliveries: 0,
      };
    }
    productMap[pid].quantities.push(d.quantity);
    productMap[pid].total_deliveries += 1;
    // Orden descendente → la primera aparición es la más reciente
    if (productMap[pid].last_quantity === null) {
      productMap[pid].last_quantity = d.quantity;
    }
  });

  const productsSummary = Object.values(productMap).map((p) => ({
    product_name: p.product_name,
    avg_quantity: parseFloat(
      (p.quantities.reduce((a, b) => a + b, 0) / p.quantities.length).toFixed(
        2,
      ),
    ),
    total_deliveries: p.total_deliveries,
    last_quantity: p.last_quantity,
  }));

  // 5. Últimas 10 entregas para historial reciente
  const recentDeliveries = deliveries.slice(0, 10).map((d) => ({
    delivered_at: d.delivered_at,
    product_name: d.product?.name ?? "Desconocido",
    quantity: d.quantity,
    notes: d.notes,
  }));

  return {
    client: {
      id: client.id,
      name: client.name,
      client_type: client.client_type,
      phone: client.phone,
      address: client.address,
      is_active: client.is_active,
      business_type: client.business_type?.name ?? null,
    },
    stats: {
      total_deliveries: totalDeliveries,
      days_since_last_delivery: daysSinceLast,
      last_delivery_date: lastDelivery?.delivered_at ?? null,
      inactive_alert: inactiveAlert,
      most_common_day: mostCommonDay,
    },
    products_summary: productsSummary,
    recent_deliveries: recentDeliveries,
  };
};

export const getClientDeliveries = async (clientId, limit = 20, offset = 0) => {
  const { data, error, count } = await supabase
    .from("delivery")
    .select("delivered_at, day_of_week, quantity, notes, product(name)", {
      count: "exact",
    })
    .eq("client_id", clientId)
    .order("delivered_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    deliveries: data.map((d) => ({
      delivered_at: d.delivered_at,
      day_of_week: d.day_of_week,
      product_name: d.product?.name ?? "Desconocido",
      quantity: d.quantity,
      notes: d.notes,
    })),
    total: count,
    limit,
    offset,
  };
};
