const detectIntent = (message = "") => {

  const text =
    message.toLowerCase().trim();

  // ─────────────────────────
  // MODIFY BOOKING
  // ─────────────────────────
  if (
    text.includes("modify") ||
    text.includes("change booking") ||
    text.includes("reschedule") ||
    text.includes("update booking") ||
    text.includes("change time") ||
    text.includes("change date")
  ) {
    return "MODIFY";
  }

  // ─────────────────────────
  // CANCEL BOOKING
  // ─────────────────────────
  if (
    text.includes("cancel") ||
    text.includes("delete booking") ||
    text.includes("remove booking") ||
    text.includes("delete")
  ) {
    return "CANCEL";
  }

  // ─────────────────────────
  // CHECK AVAILABILITY
  // ─────────────────────────
  if (
    text.includes("available") ||
    text.includes("availability") ||
    text.includes("free halls") ||
    text.includes("booked halls") ||
    text.includes("which halls are booked") ||
    text.includes("is hall") ||
    text.includes("hall available")
  ) {
    return "CHECK_AVAILABILITY";
  }

  // ─────────────────────────
  // CREATE BOOKING
  // ─────────────────────────
  if (
    text.includes("book") ||
    text.includes("reserve")
  ) {
    return "BOOK";
  }

  // ─────────────────────────
  // NORMAL CHAT
  // ─────────────────────────
  return "CHAT";
};

module.exports = detectIntent;