const db = require("../../db");
const extractBookingDetails = require("../../utils/extractBookingDetails");
const normalizeHall = require("../../utils/normalizeHall");
const { createBooking } = require("../bookingService");
const { pendingBookings, pendingConfirmations } = require("./pendingStore");

const validHalls = [
  "Conference Hall A",
  "Conference Hall B",
  "Conference Hall C",
];

const handleBookingFlow = async (req, res) => {
  const userId = req.user.id;

  // ─────────────────────────────
  // HANDLE CONFIRMATION
  // ─────────────────────────────
  if (pendingConfirmations[userId]) {
    const lower = req.body.message.toLowerCase().trim();

    if (lower === "yes" || lower === "confirm") {
      const data = pendingConfirmations[userId];

      const [conflicts] = await db.execute(
        `SELECT * FROM bookings
         WHERE hall = ? AND date = ?
         AND (start_time < ? AND end_time > ?)`,
        [data.hall, data.date, data.end_time, data.start_time]
      );

      if (conflicts.length > 0) {
        delete pendingConfirmations[userId];
        return res.json({
          reply: `${data.hall} is already booked during that time.`,
        });
      }

      await createBooking(req.user, data);
      delete pendingConfirmations[userId];

      return res.json({
        reply:
`✅ Booking Confirmed

Hall    : ${data.hall}
Date    : ${data.date}
Time    : ${data.start_time} - ${data.end_time}
Purpose : ${data.purpose}`,
      });
    }

    if (lower === "no" || lower === "cancel") {
      delete pendingConfirmations[userId];
      return res.json({ reply: "Booking cancelled." });
    }

    return res.json({
      reply: "Reply YES to confirm or NO to cancel.",
    });
  }

  // ─────────────────────────────
  // EXTRACT + MERGE
  // ─────────────────────────────
  const existing = pendingBookings[userId] || {};

  //  Detect if message looks like time / hall / date
  const hasTimePattern = /\d{1,2}(:\d{2})?\s*(to|-|am|pm)/i.test(req.body.message);
  const hasHallPattern = /hall\s*[abc]|conference/i.test(req.body.message);
  const hasDatePattern = /today|tomorrow|\d{4}-\d{2}-\d{2}/i.test(req.body.message);

  //  Only treat message as direct purpose when:
  // all other fields exist + message doesn't look like time/hall/date
  const onlyPurposeMissing =
    existing.hall &&
    existing.date &&
    existing.start_time &&
    existing.end_time &&
    !existing.purpose &&
    !hasTimePattern &&
    !hasHallPattern &&
    !hasDatePattern;

  let extracted;

  if (onlyPurposeMissing) {
    //  Take entire message directly as purpose
    extracted = {
      hall:       "",
      date:       "",
      start_time: "",
      end_time:   "",
      purpose:    req.body.message.trim(),
    };
  } else {
    extracted = await extractBookingDetails(req.body.message);
  }

  const data = {
    hall:       extracted.hall       || existing.hall,
    date:       extracted.date       || existing.date,
    start_time: extracted.start_time || existing.start_time,
    end_time:   extracted.end_time   || existing.end_time,
    purpose:    extracted.purpose    || existing.purpose,
  };

  data.hall = normalizeHall(data.hall);

  // ─────────────────────────────
  // VALIDATION
  // ─────────────────────────────
  if (data.hall && !validHalls.includes(data.hall)) {
    return res.json({
      reply:
`Invalid hall. Available halls:
- Conference Hall A
- Conference Hall B
- Conference Hall C`,
    });
  }

  if (data.start_time && data.end_time && data.start_time >= data.end_time) {
    return res.json({
      reply: "End time must be after start time.",
    });
  }

  // ─────────────────────────────
  // CHECK MISSING FIELDS
  // ─────────────────────────────
  const missing = [];
  if (!data.hall)       missing.push("hall");
  if (!data.date)       missing.push("date");
  if (!data.start_time) missing.push("start time");
  if (!data.end_time)   missing.push("end time");
  if (!data.purpose)    missing.push("purpose");

  if (missing.length > 0) {
    pendingBookings[userId] = data;
    return res.json({
      reply: `Please provide: ${missing.join(", ")}`,
    });
  }

  // ─────────────────────────────
  // CHECK AVAILABILITY
  // ─────────────────────────────
  const [conflicts] = await db.execute(
    `SELECT * FROM bookings
     WHERE hall = ? AND date = ?
     AND (start_time < ? AND end_time > ?)`,
    [data.hall, data.date, data.end_time, data.start_time]
  );

  if (conflicts.length > 0) {
    delete pendingBookings[userId];
    return res.json({
      reply: `${data.hall} is already booked on ${data.date} from ${data.start_time} to ${data.end_time}.`,
    });
  }

  delete pendingBookings[userId];
  pendingConfirmations[userId] = data;

  return res.json({
    reply:
` Booking Confirmation

Hall    : ${data.hall}
Date    : ${data.date}
Time    : ${data.start_time} - ${data.end_time}
Purpose : ${data.purpose}

Reply YES to confirm
Reply NO to cancel`,
  });
};

module.exports = handleBookingFlow;