// Manejador central que ataja los errores y devuelve el JSON estructurado
// Se usa pasandole 'next(error)' en el bloque catch de los controladores
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Imprime el error en la terminal para que nosotros lo veamos
  
  // Devuelve un error 500 generico al cliente si es que el error no trae un status personalizado
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
};
