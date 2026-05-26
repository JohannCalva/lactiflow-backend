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

    const clientSuggestions = [];

    for (const productId of productIds) {
      // 3. Historial de los últimos 60 días
      const entregas = await getHistoryByClientInWindow(
        client.id,
        productId,
        90,
      );

      // 4. Mínimo 2 entregas para calcular gaps
      if (entregas.length < 2) continue;

      // Paso 1 — ¿Cuándo?
      const gaps = [];
      for (let i = 1; i < entregas.length; i++) {
        const fechaActual = new Date(`${entregas[i].delivered_at}T12:00:00Z`);
        const fechaAnterior = new Date(
          `${entregas[i - 1].delivered_at}T12:00:00Z`,
        );
        const gap = (fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24);
        gaps.push(gap);
      }

      const avgGap = calcAverage(gaps);
      const maxGap = Math.max(...gaps);
      const minGap = Math.min(...gaps);
      const spread =
        gaps.length > 0 && avgGap > 0 ? (maxGap - minGap) / avgGap : 0;

      const lastDate = entregas[entregas.length - 1].delivered_at;
      const nextDate = addDays(lastDate, Math.round(avgGap));

      // Paso 2 — ¿Cuánto?
      const N = entregas.length;
      const cantidades = entregas.map((e) => Number(e.quantity));

      let suggestedQty, confidence, method;

      if (spread > 0.35) {
        // Fechas impredecibles — sin importar cuántas entregas haya, no se puede confiar
        suggestedQty = Math.round(calcAverage(cantidades));
        confidence = "baja";
        method = "Fallback";
      } else if (N < 3) {
        suggestedQty = Math.round(calcAverage(cantidades));
        confidence = "baja";
        method = "Baseline";
      } else if (N < 8) {
        suggestedQty = Math.round(calcMedian(cantidades));
        confidence = "media";
        method = "Baseline";
      } else {
        const baseline = calcMedian(cantidades);
        const trend = calcAverage(cantidades.slice(-3));
        const desviaciones = cantidades.map((q) => Math.abs(q - baseline));
        const mad = calcMedian(desviaciones);

        if (mad === 0) {
          suggestedQty = Math.round(baseline);
          confidence = "alta";
          method = "Baseline";
        } else {
          const score = Math.abs(trend - baseline) / mad;
          if (score > 2) {
            suggestedQty = Math.round(trend);
            confidence = "alta";
            method = "Trend";
          } else {
            suggestedQty = Math.round(baseline);
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
          delivery_count: N,
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

      clientSuggestions.push({ spread });
      details.push({
        client: client.name,
        product: productData?.name ?? productId,
        next_date: nextDate,
        suggested_qty: Math.round(suggestedQty * 100) / 100,
        confidence,
        method,
        delivery_count: N,
        avg_gap: Math.round(avgGap * 100) / 100,
        spread: Math.round(spread * 10000) / 10000,
      });
    }

    // 7. Calcular client_type como subproducto
    const total = clientSuggestions.length;
    if (total > 0) {
      const regularCount = clientSuggestions.filter(
        (s) => s.spread <= 0.35,
      ).length;
      const irregularCount = clientSuggestions.filter(
        (s) => s.spread > 0.35,
      ).length;

      let newType;
      if (regularCount / total >= 0.7) {
        newType = "A";
      } else if (irregularCount / total >= 0.7) {
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
