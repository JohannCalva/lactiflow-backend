import { generateSuggestions } from "../services/suggestion.service.js";

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
