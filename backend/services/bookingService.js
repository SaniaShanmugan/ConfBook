const db = require("../db");

async function createBooking(user, data) {

  await db.execute(
    `INSERT INTO bookings
    (
      user_id,
      user_email,
      hall,
      date,
      start_time,
      end_time,
      purpose
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.email,
      data.hall,
      data.date,
      data.start_time,
      data.end_time,
      data.purpose || "",
    ]
  );
}

async function cancelBooking(user, data) {

  return db.execute(
    `DELETE FROM bookings
     WHERE user_id = ?
     AND hall = ?
     AND date = ?`,
    [
      user.id,
      data.hall,
      data.date,
    ]
  );
}

module.exports = {
  createBooking,
  cancelBooking,
};