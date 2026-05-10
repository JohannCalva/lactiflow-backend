import * as DeliveryModel from "../models/delivery.model.js";

const getDayOfWeek = (dateString) => {
  // Agregamos 'T12:00:00Z' para evitar que Javascript mueva el dia de la fecha si es que el servidor
  // esta en otra zona horaria distinta a UTC
  const date = new Date(`${dateString}T12:00:00Z`);
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  // getUTCDay nos devuelve un numero del 0 al 6 y sacamos el string del arreglo
  return days[date.getUTCDay()];
};

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

    const data = await DeliveryModel.updateDelivery(req.params.id, deliveryData);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await DeliveryModel.deleteDelivery(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
