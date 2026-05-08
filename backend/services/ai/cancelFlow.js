const db = require("../../db");

const extractBookingDetails =
  require("../../utils/extractBookingDetails");

const normalizeHall =
  require("../../utils/normalizeHall");

const {
  pendingCancels,
  pendingCancelConfirmations,
} = require("./pendingStore");

const handleCancelFlow = async (
  req,
  res
) => {

  const userId = req.user.id;

  // ─────────────────────────────
  // HANDLE CONFIRMATION
  // ─────────────────────────────
  if (
    pendingCancelConfirmations[userId]
  ) {

    const lower =
      req.body.message
        .toLowerCase()
        .trim();

    if (
      lower === "yes" ||
      lower === "confirm"
    ) {

      const data =
        pendingCancelConfirmations[userId];

      const [result] =
        await db.execute(
          `DELETE FROM bookings
           WHERE user_id = ?
           AND hall = ?
           AND date = ?
           AND start_time = ?
           AND end_time = ?`,
          [
            req.user.id,
            data.hall,
            data.date,
            data.start_time,
            data.end_time,
          ]
        );

      delete pendingCancelConfirmations[userId];

      if (
        result.affectedRows === 0
      ) {

        return res.json({
          reply:
            "No matching booking found.",
        });
      }

      return res.json({
        reply:
`Booking Cancelled

Hall       : ${data.hall}
Date       : ${data.date}
Time       : ${data.start_time} - ${data.end_time}`,
      });
    }

    if (
      lower === "no" ||
      lower === "cancel"
    ) {

      delete pendingCancelConfirmations[userId];

      return res.json({
        reply:
          "Cancellation aborted.",
      });
    }

    return res.json({
      reply:
        "Reply YES to confirm cancellation or NO to abort.",
    });
  }

  // ─────────────────────────────
  // HANDLE PENDING FLOW
  // ─────────────────────────────
  const existing =
    pendingCancels[userId] || {};

  const extracted =
    await extractBookingDetails(
      req.body.message
    );

  const data = {
    hall:
      extracted.hall || existing.hall,

    date:
      extracted.date || existing.date,

    start_time:
      extracted.start_time ||
      existing.start_time,

    end_time:
      extracted.end_time ||
      existing.end_time,
  };

  data.hall =
    normalizeHall(data.hall);

  const missing = [];

  if (!data.hall)
    missing.push("hall");

  if (!data.date)
    missing.push("date");

  if (!data.start_time)
    missing.push("start time");

  if (!data.end_time)
    missing.push("end time");

  if (missing.length > 0) {

    pendingCancels[userId] = data;

    return res.json({
      reply:
        `Please provide: ${missing.join(", ")}`,
    });
  }

  const [rows] =
    await db.execute(
      `SELECT * FROM bookings
       WHERE user_id = ?
       AND hall = ?
       AND date = ?
       AND start_time = ?
       AND end_time = ?`,
      [
        req.user.id,
        data.hall,
        data.date,
        data.start_time,
        data.end_time,
      ]
    );

  if (rows.length === 0) {

    delete pendingCancels[userId];

    return res.json({
      reply:
        "No matching booking found. Please restart the cancellation with correct details.",
    });
  }

  delete pendingCancels[userId];

  pendingCancelConfirmations[userId] =
    data;

  return res.json({
    reply:
`Cancellation Confirmation

Hall       : ${data.hall}
Date       : ${data.date}
Time       : ${data.start_time} - ${data.end_time}

Reply YES to confirm
Reply NO to abort`,
  });
};

module.exports =
  handleCancelFlow;