const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");
const router = express.Router();


const formatDate = (date) => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};


const formatTime = (time) => String(time).slice(0, 5);

const formatBooking = (b) => ({
  ...b,
  date: formatDate(b.date),
  start_time: formatTime(b.start_time),
  end_time: formatTime(b.end_time),
});


router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bookings");
    res.json(rows.map(formatBooking));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/date/:date", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM bookings WHERE DATE(date) = ?",
      [req.params.date]
    );
    res.json(rows.map(formatBooking));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/dates", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT DISTINCT DATE(date) as date FROM bookings WHERE STR_TO_DATE(CONCAT(date, ' ', end_time), '%Y-%m-%d %H:%i:%s') > NOW()"
    );
    res.json(rows.map((r) => formatDate(r.date)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ───────── CREATE BOOKING ─────────
router.post("/", auth, async (req, res) => {

  const {
    hall,
    date,
    start_time,
    end_time,
    purpose,
  } = req.body;

  try {

    // ─────────────────────────────
    // VALID HALLS
    // ─────────────────────────────
    const validHalls = [
      "Conference Hall A",
      "Conference Hall B",
      "Conference Hall C",
    ];

    if (!validHalls.includes(hall)) {
      return res.status(400).json({
        error: "Invalid hall selected",
      });
    }

    // ─────────────────────────────
    // REQUIRED FIELDS
    // ─────────────────────────────
    if (
      !hall ||
      !date ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // ─────────────────────────────
    // TIME VALIDATION
    // ─────────────────────────────
    if (start_time >= end_time) {
      return res.status(400).json({
        error: "End time must be after start time",
      });
    }

    // ─────────────────────────────
    // PREVENT PAST BOOKINGS
    // ─────────────────────────────
    const today =
      new Date().toISOString().split("T")[0];

    if (date < today) {
      return res.status(400).json({
        error: "Cannot book past dates",
      });
    }

    // ─────────────────────────────
    // OVERLAP CHECK
    // ─────────────────────────────
    const [conflicts] = await db.execute(
      `SELECT * FROM bookings
       WHERE hall = ?
       AND date = ?
       AND (
          start_time < ?
          AND end_time > ?
       )`,
      [
        hall,
        date,
        end_time,
        start_time,
      ]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        error:
          "This slot is already booked",
      });
    }

    // ─────────────────────────────
    // CREATE BOOKING
    // ─────────────────────────────
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
        req.user.id,
        req.user.email,
        hall,
        date,
        start_time,
        end_time,
        purpose || "",
      ]
    );

    return res.json({
      message: "Booking created",
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Server error",
    });
  }
});

// ───────── DELETE ─────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const [result] = await db.execute(
  "DELETE FROM bookings WHERE id = ? AND user_id = ?",
  [req.params.id, req.user.id]
);

if (result.affectedRows === 0) {
  return res.status(404).json({
    error: "Booking not found",
  });
}

res.json({
  message: "Booking deleted",
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/:id/notified", auth, async (req, res) => {
  try {
    await db.execute(
      "UPDATE bookings SET notified = 1 WHERE id = ?",
      [req.params.id]
    );
    res.json({ message: "Marked as notified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;