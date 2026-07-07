import * as ClientModel from "../models/client.model.js";
import * as DeliveryModel from "../models/delivery.model.js";
import * as SuggestionModel from "../models/suggestion.model.js";
import * as ProductModel from "../models/product.model.js";
import { calculatePrediction, classifyClient } from "./suggestion.engine.js";

export const generateSuggestions = async (filterClientId = null) => {
  const clients = await ClientModel.getActiveClients(filterClientId);

  let totalSuggestions = 0;
  let reclassifiedCount = 0;
  const details = [];

  for (const client of clients) {
    const productIds = await DeliveryModel.getDistinctProductIdsForClient(
      client.id,
    );

    const clientBehaviourPerProduct = [];

    for (const productId of productIds) {
      const clientDeliveriesHistory =
        await DeliveryModel.getHistoryByClientInWindow(
          client.id,
          productId,
          90,
        );

      if (clientDeliveriesHistory.length < 2) continue;

      const prediction = calculatePrediction({
        deliveries: clientDeliveriesHistory,
      });

      await SuggestionModel.upsertSuggestionForClientProduct({
        client_id: client.id,
        product_id: productId,
        generated_at: new Date().toISOString(),
        ...prediction,
      });

      totalSuggestions++;

      const productData = await ProductModel.getProductById(productId);

      clientBehaviourPerProduct.push({ spread: prediction.spread });
      details.push({
        client: client.name,
        product: productData?.name ?? productId,
        ...prediction,
      });
    }

    const newType = classifyClient(clientBehaviourPerProduct);
    if (newType) {
      await ClientModel.updateClient(client.id, { client_type: newType });
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
