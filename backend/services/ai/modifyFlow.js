const db = require("../../db");
const extractBookingDetails = require("../../utils/extractBookingDetails");
const normalizeHall = require("../../utils/normalizeHall");
const { pendingModify, pendingModifyConfirmations } = require("./pendingStore");

const handleModifyFlow = async (req, res) => {
  const userId = req.user.id;

  // ─────────────────────────────
  // HANDLE MODIFICATION CONFIRMATION
  // ─────────────────────────────
  if (pendingModifyConfirmations[userId]) {
    const lower = req.body.message.toLowerCase().trim();

    if (lower === "yes" || lower === "confirm") {
      const { old: oldData, new: newData } = pendingModifyConfirmations[userId];

      // ── Check new slot availability ──
      const [conflicts] = await db.execute(
        `SELECT * FROM bookings
         WHERE hall = ? AND date = ?
         AND (start_time < ? AND end_time > ?)
         AND user_id != ?`,
        [newData.hall, newData.date, newData.end_time, newData.start_time, req.user.id]
      );

      if (conflicts.length > 0) {
        delete pendingModifyConfirmations[userId];
        return res.json({
          reply:
` Slot Unavailable

${newData.hall} is already booked on
${newData.date} from ${newData.start_time} to ${newData.end_time}.

Please choose a different time or date.`,
        });
      }

      // ── Delete old booking ──
      await db.execute(
        `DELETE FROM bookings
         WHERE user_id = ?
         AND hall = ?
         AND date = ?
         AND start_time = ?
         AND end_time = ?`,
        [req.user.id, oldData.hall, oldData.date, oldData.start_time, oldData.end_time]
      );

      // ── Create new booking ──
      await db.execute(
        `INSERT INTO bookings
         (user_id, user_email, hall, date, start_time, end_time, purpose)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          req.user.email,
          newData.hall,
          newData.date,
          newData.start_time,
          newData.end_time,
          newData.purpose || oldData.purpose,
        ]
      );

      delete pendingModifyConfirmations[userId];

return res.json({
  reply:
`Booking Modified!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OLD BOOKING (cancelled)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hall       : ${oldData.hall}
Date       : ${oldData.date}
Time       : ${oldData.start_time} – ${oldData.end_time}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW BOOKING (confirmed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hall       : ${newData.hall}
Date       : ${newData.date}
Time       : ${newData.start_time} – ${newData.end_time}
Purpose    : ${newData.purpose || oldData.purpose}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your booking has been updated!`,
});
    }

    if (lower === "no" || lower === "cancel") {
      delete pendingModifyConfirmations[userId];
      return res.json({
        reply: "✅ Modification cancelled. Your original booking is still active.",
      });
    }

    return res.json({
      reply: "Please reply YES to confirm or NO to cancel.",
    });
  }

  // ─────────────────────────────
  // STEP 1 — GET OLD BOOKING DETAILS
  // ─────────────────────────────
  const existing = pendingModify[userId] || {};

  const extracted = await extractBookingDetails(req.body.message);

  // ── Phase 1: collect old booking ──
  if (!existing.old_complete) {
    const old = {
      hall:       extracted.hall       || existing.hall,
      date:       extracted.date       || existing.date,
      start_time: extracted.start_time || existing.start_time,
      end_time:   extracted.end_time   || existing.end_time,
    };

    old.hall = normalizeHall(old.hall);

    const missingOld = [];
    if (!old.hall)       missingOld.push("hall");
    if (!old.date)       missingOld.push("date");
    if (!old.start_time) missingOld.push("start time");
    if (!old.end_time)   missingOld.push("end time");

    if (missingOld.length > 0) {
      pendingModify[userId] = { ...existing, ...old };
      return res.json({
        reply:
` Which booking do you want to modify?

Please provide: ${missingOld.join(", ")}`,
      });
    }

    // ── Verify old booking exists ──
    const [rows] = await db.execute(
      `SELECT * FROM bookings
       WHERE user_id = ?
       AND hall = ?
       AND date = ?
       AND start_time = ?
       AND end_time = ?`,
      [req.user.id, old.hall, old.date, old.start_time, old.end_time]
    );

    if (rows.length === 0) {
      delete pendingModify[userId];
      return res.json({
        reply:
` Booking Not Found

No booking matched:
 Hall  :  ${old.hall}
 Date  :  ${old.date}
 Time  :  ${old.start_time} – ${old.end_time}

Please check your details and try again.`,
      });
    }

    // ── Old booking found — ask for new details ──
    pendingModify[userId] = {
      ...old,
      old_complete: true,
      purpose: rows[0].purpose,
    };

    return res.json({
      reply:
`✅ Booking found!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Hall     :  ${old.hall}
 Date     :  ${old.date}
 Time     :  ${old.start_time} – ${old.end_time}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now tell me the new date or time you'd like.
For example:
  • "Change to tomorrow 2pm to 3pm"
  • "Change date to 2026-05-10"
  • "Change time to 10am to 11am"`,
    });
  }

  // ─────────────────────────────
  // STEP 2 — GET NEW BOOKING DETAILS
  // ─────────────────────────────
  const oldBooking = {
    hall:       existing.hall,
    date:       existing.date,
    start_time: existing.start_time,
    end_time:   existing.end_time,
    purpose:    existing.purpose,
  };

  // ── Merge new details — keep old values as fallback ──
  const newBooking = {
    hall:       normalizeHall(extracted.hall)       || oldBooking.hall,
    date:       extracted.date                      || existing.new_date       || oldBooking.date,
    start_time: extracted.start_time                || existing.new_start_time || oldBooking.start_time,
    end_time:   extracted.end_time                  || existing.new_end_time   || oldBooking.end_time,
    purpose:    extracted.purpose                   || oldBooking.purpose,
  };

  // ── Make sure something actually changed ──
  const nothingChanged =
    newBooking.hall       === oldBooking.hall &&
    newBooking.date       === oldBooking.date &&
    newBooking.start_time === oldBooking.start_time &&
    newBooking.end_time   === oldBooking.end_time;

  if (nothingChanged) {
    pendingModify[userId] = {
      ...existing,
      new_date:       newBooking.date,
      new_start_time: newBooking.start_time,
      new_end_time:   newBooking.end_time,
    };
    return res.json({
      reply:
` No changes detected.

Please tell me what you'd like to change:
  • New date  (e.g. "change to tomorrow")
  • New time  (e.g. "change to 3pm to 4pm")
  • New hall  (e.g. "change to Hall A")`,
    });
  }

  if (newBooking.start_time >= newBooking.end_time) {
    return res.json({
      reply: "End time must be after start time. Please provide a valid time range.",
    });
  }

  delete pendingModify[userId];
  pendingModifyConfirmations[userId] = {
    old: oldBooking,
    new: newBooking,
  };

return res.json({
  reply:
`Modify Confirmation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OLD BOOKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hall       : ${oldBooking.hall}
Date       : ${oldBooking.date}
Time       : ${oldBooking.start_time} – ${oldBooking.end_time}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW BOOKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hall       : ${newBooking.hall}
Date       : ${newBooking.date}
Time       : ${newBooking.start_time} – ${newBooking.end_time}
Purpose    : ${newBooking.purpose}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply YES to confirm
Reply NO to cancel`,
});
};

module.exports = handleModifyFlow;