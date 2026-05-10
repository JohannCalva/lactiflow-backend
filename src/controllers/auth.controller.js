import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as UserModel from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificamos que no vengan vacios
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    // Buscamos el usuario por su correo
    const user = await UserModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Comparamos la contraseña en texto plano con el hash guardado en base de datos
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generamos el token de sesion que durara 12 horas, le metemos id, email y rol para usarlo luego
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Separamos la contraseña para no devolverla en la respuesta y evitar fugas de datos
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: "Login exitoso",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  // Como usamos JWT (Stateless), el logout real lo hace el frontend borrando el token de su lado
  res.json({ message: "Logout exitoso" });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Expresion regular basica para comprobar que el texto tiene formato de correo electronico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }
    
    if (!password) {
      return res.status(400).json({ error: "La contraseña es requerida" });
    }

    // Verificamos que nadie mas tenga ese mismo correo
    const existingUser = await UserModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hasheamos la contraseña 10 veces por seguridad antes de guardarla en supabase
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password_hash,
      role: role || "emprendedor" // Si no mandan un rol, se queda como emprendedor
    };

    // Guardamos el registro en la base de datos
    const userSaved = await UserModel.createUser(newUser);

    // Creamos un token para loguearlo de una vez y que no tenga que poner su clave de nuevo
    const token = jwt.sign(
      { id: userSaved.id, email: userSaved.email, role: userSaved.role },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Quitamos la contraseña generada
    const { password_hash: _ph, ...userWithoutPassword } = userSaved;

    res.status(201).json({
      message: "Registro exitoso",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};
