import supabase from "../config/supabase.js";
import { addDays } from "../utils/date.utils.js";
import { getHistoryByClientInWindow } from "../models/delivery.model.js";

const calcMedian = (arr) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

const calcAverage = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length;

export const generateSuggestions = async (filterClientId = null) => {
  // 1. Obtener clientes activos
  let query = supabase.from("client").select("*").eq("is_active", true);
  if (filterClientId) {
    query = query.eq("id", filterClientId);
  }
  const { data: clients, error: clientsError } = await query;
  if (clientsError) throw clientsError;

  let totalSuggestions = 0;
  let reclassifiedCount = 0;
  const details = [];

  for (const client of clients) {
    // 2. Obtener productos distintos pedidos por este cliente
    const { data: deliveryRows, error: deliveryError } = await supabase
      .from("delivery")
      .select("product_id")
      .eq("client_id", client.id);
    if (deliveryError) throw deliveryError;

    const productIds = [...new Set(deliveryRows.map((d) => d.product_id))];

    const clientBehaviourPerProduct = [];

    for (const productId of productIds) {
      // 3. Historial de los últimos 90 días
      const clientDeliveriesHistory = await getHistoryByClientInWindow(
        client.id,
        productId,
        90,
      );

      // 4. Mínimo 2 entregas para calcular gaps
      if (clientDeliveriesHistory.length < 2) continue;

      // Paso 1 — ¿Cuándo?
      const deliveryIntervals = [];
      for (let i = 1; i < clientDeliveriesHistory.length; i++) {
        const fechaActual = new Date(`${clientDeliveriesHistory[i].delivered_at}T12:00:00Z`);
        const fechaAnterior = new Date(
          `${clientDeliveriesHistory[i - 1].delivered_at}T12:00:00Z`,
        );
        const gap = (fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24);
        deliveryIntervals.push(gap);
      }

      const avgGap = calcAverage(deliveryIntervals);
      const maxGap = Math.max(...deliveryIntervals);
      const minGap = Math.min(...deliveryIntervals);
      const spread =
        deliveryIntervals.length > 0 && avgGap > 0 ? (maxGap - minGap) / avgGap : 0;

      const lastDate = clientDeliveriesHistory[clientDeliveriesHistory.length - 1].delivered_at;
      const nextDate = addDays(lastDate, Math.round(avgGap));

      // Paso 2 — ¿Cuánto?
      const deliveryCount = clientDeliveriesHistory.length;
      const deliveredQuantities = clientDeliveriesHistory.map((e) => Number(e.quantity));

      let suggestedQty, confidence, method;

      if (spread > 0.35) {
        // Fechas impredecibles — sin importar cuántas entregas haya, no se puede confiar
        suggestedQty = Math.round(calcAverage(deliveredQuantities));
        confidence = "baja";
        method = "Fallback";
      } else if (deliveryCount < 3) {
        suggestedQty = Math.round(calcAverage(deliveredQuantities));
        confidence = "baja";
        method = "Baseline";
      } else if (deliveryCount < 8) {
        suggestedQty = Math.round(calcMedian(deliveredQuantities));
        confidence = "media";
        method = "Baseline";
      } else {
        const medianQuantity = calcMedian(deliveredQuantities);
        const recentAvgQty = calcAverage(deliveredQuantities.slice(-3));
        const deviationsFromMedian = deliveredQuantities.map((q) => Math.abs(q - medianQuantity));
        const medianAbsDeviation = calcMedian(deviationsFromMedian);

        if (medianAbsDeviation === 0) {
          suggestedQty = Math.round(medianQuantity);
          confidence = "alta";
          method = "Baseline";
        } else {
          const trendDeviationScore = Math.abs(recentAvgQty - medianQuantity) / medianAbsDeviation;
          if (trendDeviationScore > 2) {
            suggestedQty = Math.round(recentAvgQty);
            confidence = "alta";
            method = "Trend";
          } else {
            suggestedQty = Math.round(medianQuantity);
            confidence = "alta";
            method = "Baseline";
          }
        }
      }

      // 6. Persistir via UPSERT
      const { error: upsertError } = await supabase.from("suggestion").upsert(
        {
          client_id: client.id,
          product_id: productId,
          next_date: nextDate,
          suggested_qty: Math.round(suggestedQty * 100) / 100,
          confidence,
          method,
          delivery_count: deliveryCount,
          avg_gap: Math.round(avgGap * 100) / 100,
          spread: Math.round(spread * 10000) / 10000,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "client_id,product_id" },
      );
      if (upsertError) throw upsertError;

      totalSuggestions++;

      // Obtener nombre del producto para el detalle
      const { data: productData } = await supabase
        .from("product")
        .select("name")
        .eq("id", productId)
        .single();

      clientBehaviourPerProduct.push({ spread });
      details.push({
        client: client.name,
        product: productData?.name ?? productId,
        next_date: nextDate,
        suggested_qty: Math.round(suggestedQty * 100) / 100,
        confidence,
        method,
        delivery_count: deliveryCount,
        avg_gap: Math.round(avgGap * 100) / 100,
        spread: Math.round(spread * 10000) / 10000,
      });
    }

    // 7. Calcular client_type como subproducto
    const totalClientSuggestions = clientBehaviourPerProduct.length;
    if (totalClientSuggestions > 0) {
      const regularCount = clientBehaviourPerProduct.filter(
        (s) => s.spread <= 0.35,
      ).length;
      const irregularCount = clientBehaviourPerProduct.filter(
        (s) => s.spread > 0.35,
      ).length;

      let newType;
      if (regularCount / totalClientSuggestions >= 0.7) {
        newType = "A";
      } else if (irregularCount / totalClientSuggestions >= 0.7) {
        newType = "C";
      } else {
        newType = "B";
      }

      await supabase
        .from("client")
        .update({ client_type: newType })
        .eq("id", client.id);

      if (newType !== client.client_type) {
        reclassifiedCount++;
      }
    }
  }

  return {
    processed: clients.length,
    suggestions: totalSuggestions,
    reclassified: reclassifiedCount,
    details,
  };
};
