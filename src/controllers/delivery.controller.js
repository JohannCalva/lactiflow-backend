import * as DeliveryModel from "../models/delivery.model.js";
import { getDayOfWeek } from "../utils/date.utils.js";
import { generateSuggestions } from "../services/suggestion.service.js";

export const getAll = async (req, res, next) => {
  try {
    const data = await DeliveryModel.getAllDeliveries();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await DeliveryModel.getDeliveryById(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const deliveryData = { ...req.body };

    // Calculamos el dia de la semana antes de mandar a base de datos
    if (deliveryData.delivered_at) {
      deliveryData.day_of_week = getDayOfWeek(deliveryData.delivered_at);
    }

    const data = await DeliveryModel.createDelivery(deliveryData);
    generateSuggestions(data.client_id).catch((err) =>
      console.error("Error recalculando prediccion tras entrega:", err),
    );
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const deliveryData = { ...req.body };

    // Si estan cambiando la fecha, tenemos que recalcular el dia obligatoriamente
    if (deliveryData.delivered_at) {
      deliveryData.day_of_week = getDayOfWeek(deliveryData.delivered_at);
    }

    const data = await DeliveryModel.updateDelivery(
      req.params.id,
      deliveryData,
    );
    generateSuggestions(data.client_id).catch((err) =>
      console.error("Error recalculando prediccion tras actualizacion:", err),
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const delivery = await DeliveryModel.getDeliveryById(req.params.id);
    await DeliveryModel.deleteDelivery(req.params.id);
    if (delivery?.client_id) {
      generateSuggestions(delivery.client_id).catch((err) =>
        console.error("Error recalculando prediccion tras borrado:", err),
      );
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
