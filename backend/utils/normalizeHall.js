const normalizeHall = (hall) => {

  if (!hall) return "";

  const lower = hall.toLowerCase();

  if (
    lower === "a" ||
    lower === "hall a"
  ) {
    return "Conference Hall A";
  }

  if (
    lower === "b" ||
    lower === "hall b"
  ) {
    return "Conference Hall B";
  }

  if (
    lower === "c" ||
    lower === "hall c"
  ) {
    return "Conference Hall C";
  }

  return hall;
};

module.exports = normalizeHall;