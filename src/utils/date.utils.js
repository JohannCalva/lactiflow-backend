export const getDayOfWeek = (dateString) => {
  const date = new Date(`${dateString}T12:00:00Z`);
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ];
  return days[date.getUTCDay()];
};

export const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0];
};
