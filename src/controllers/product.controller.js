import * as ProductModel from "../models/product.model.js";

export const getAll = async (req, res, next) => {
  try {
    const data = await ProductModel.getAllProducts();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await ProductModel.getProductById(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await ProductModel.createProduct(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await ProductModel.updateProduct(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await ProductModel.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
