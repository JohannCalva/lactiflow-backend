import { addDays } from "../utils/date.utils.js";

export const calcMedian = (arr) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const calcAverage = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length;

export const calculatePrediction = ({ deliveries }) => {
  // Delivery intervals
  const deliveryIntervals = [];
  for (let i = 1; i < deliveries.length; i++) {
    const fechaActual = new Date(
      `${deliveries[i].delivered_at}T12:00:00Z`,
    );
    const fechaAnterior = new Date(
      `${deliveries[i - 1].delivered_at}T12:00:00Z`,
    );
    const gap = (fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24);
    deliveryIntervals.push(gap);
  }

  const avgGap = calcAverage(deliveryIntervals);
  const maxGap = Math.max(...deliveryIntervals);
  const minGap = Math.min(...deliveryIntervals);
  const spread =
    deliveryIntervals.length > 0 && avgGap > 0
      ? (maxGap - minGap) / avgGap
      : 0;

  const lastDate = deliveries[deliveries.length - 1].delivered_at;
  const nextDate = addDays(lastDate, Math.round(avgGap));

  const deliveryCount = deliveries.length;
  const deliveredQuantities = deliveries.map((e) => Number(e.quantity));

  let suggestedQty, confidence, method;

  if (spread > 0.35) {
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
    const deviationsFromMedian = deliveredQuantities.map((q) =>
      Math.abs(q - medianQuantity),
    );
    const medianAbsDeviation = calcMedian(deviationsFromMedian);

    if (medianAbsDeviation === 0) {
      suggestedQty = Math.round(medianQuantity);
      confidence = "alta";
      method = "Baseline";
    } else {
      const trendDeviationScore =
        Math.abs(recentAvgQty - medianQuantity) / medianAbsDeviation;
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

  return {
    next_date: nextDate,
    suggested_qty: Math.round(suggestedQty * 100) / 100,
    confidence,
    method,
    delivery_count: deliveryCount,
    avg_gap: Math.round(avgGap * 100) / 100,
    spread: Math.round(spread * 10000) / 10000,
  };
};

export const classifyClient = (clientBehaviourPerProduct) => {
  const total = clientBehaviourPerProduct.length;
  if (total === 0) return null;

  const regularCount = clientBehaviourPerProduct.filter(
    (s) => s.spread <= 0.35,
  ).length;
  const irregularCount = clientBehaviourPerProduct.filter(
    (s) => s.spread > 0.35,
  ).length;

  if (regularCount / total >= 0.7) return "A";
  if (irregularCount / total >= 0.7) return "C";
  return "B";
};
