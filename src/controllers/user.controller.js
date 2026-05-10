import bcrypt from "bcrypt";
import * as UserModel from "../models/user.model.js";

// Sirve para validar que el texto que nos manden tenga estructura de correo electronico
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Funcion de utilidad para limpiar la respuesta y no devolver la contrasena hasheada al frontend
const excludePassword = (user) => {
  if (!user) return user;
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getAll = async (req, res, next) => {
  try {
    const data = await UserModel.getAllUsers();
    // Limpiamos la clave de todos los usuarios de la lista antes de mandarlos
    res.json(data.map(excludePassword));
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const data = await UserModel.getUserById(req.params.id);
    res.json(excludePassword(data));
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { email, password, ...rest } = req.body;

    // Verificamos que traiga email y que sea valido
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }
    
    if (!password) {
      return res.status(400).json({ error: "La contraseña es requerida" });
    }

    // Buscamos si ya existe alguien con ese correo para no duplicar
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hasheamos la clave del usuario (10 saltos)
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = {
      ...rest,
      email,
      password_hash,
    };

    const data = await UserModel.createUser(newUser);
    res.status(201).json(excludePassword(data));
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { email, password, ...rest } = req.body;
    
    const updateData = { ...rest };

    // Si nos pasan un nuevo email, tenemos que asegurarnos que sea valido y no choque con otro ya guardado
    if (email) {
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Formato de email inválido" });
      }
      
      const existingUser = await UserModel.getUserByEmail(email);
      // Validamos que si existe ese correo, no pertenezca a OTRA cuenta (distinta a la que estamos editando)
      if (existingUser && existingUser.id !== req.params.id) {
        return res.status(400).json({ error: "El email ya está registrado por otro usuario" });
      }
      updateData.email = email;
    }

    // Si manda password nuevo, hay que volver a encriptarlo antes de guardarlo
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const data = await UserModel.updateUser(req.params.id, updateData);
    res.json(excludePassword(data));
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await UserModel.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
