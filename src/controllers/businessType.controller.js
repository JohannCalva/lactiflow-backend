import * as BusinessTypeModel from "../models/businessType.model.js";

export const getAll = async (req, res, next) => {
  try {
    const data = await BusinessTypeModel.getAllBusinessTypes();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await BusinessTypeModel.getBusinessTypeById(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await BusinessTypeModel.createBusinessType(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await BusinessTypeModel.updateBusinessType(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await BusinessTypeModel.deleteBusinessType(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
