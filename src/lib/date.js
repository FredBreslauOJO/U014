// Parse ISO date string to local Date, ignoring timezone (assumes server sends YYYY-MM-DD in UTC).
export const getDateInLocalTimezone = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
};
