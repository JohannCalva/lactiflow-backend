import * as ClientModel from "../models/client.model.js";

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
    const data = await ClientModel.createClient(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
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
