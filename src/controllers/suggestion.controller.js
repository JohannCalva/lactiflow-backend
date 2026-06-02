import { generateSuggestions } from "../services/suggestion.service.js";
import * as SuggestionModel from "../models/suggestion.model.js";

export const generate = async (req, res, next) => {
  try {
    const result = await generateSuggestions();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const generateForClient = async (req, res, next) => {
  try {
    const result = await generateSuggestions(req.params.clientId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getByDate = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;
    let data;
    if (date) {
      data = await SuggestionModel.getSuggestionsByDate(date);
    } else if (startDate || endDate) {
      if (!startDate || !endDate) {
        return res.status(400).json({
          error: "Both startDate and endDate are required for range queries",
        });
      }
      data = await SuggestionModel.getSuggestionsByRange(startDate, endDate);
    } else {
      data = await SuggestionModel.getAllSuggestions();
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const summaryByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: date" });
    }

    const summary = await SuggestionModel.getProductTotalsByDate(date);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};
