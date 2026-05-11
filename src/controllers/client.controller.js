import * as ClientModel from "../models/client.model.js";

const phoneRegex = /^0(9\d{8}|[2-7]\d{7})$/;

export const getAll = async (req, res, next) => {
  try {
    const data = await ClientModel.getAllClients();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await ClientModel.getClientById(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    if (req.body.phone && String(req.body.phone).trim() !== "") {
      if (!phoneRegex.test(String(req.body.phone))) {
        return res.status(400).json({ error: "El teléfono debe ser un número ecuatoriano válido (móvil: 09XXXXXXXX, fijo: 0X-XXXXXXX)" });
      }
    }

    const data = await ClientModel.createClient(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    if (req.body.phone && String(req.body.phone).trim() !== "") {
      if (!phoneRegex.test(String(req.body.phone))) {
        return res.status(400).json({ error: "El teléfono debe ser un número ecuatoriano válido (móvil: 09XXXXXXXX, fijo: 0X-XXXXXXX)" });
      }
    }

    const data = await ClientModel.updateClient(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await ClientModel.deleteClient(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
