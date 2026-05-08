const db = require("../../db");

const extractBookingDetails =
  require("../../utils/extractBookingDetails");

const validHalls = [
  "Conference Hall A",
  "Conference Hall B",
  "Conference Hall C",
];

const handleAvailabilityFlow =
  async (req, res) => {

    const data =
      await extractBookingDetails(
        req.body.message
      );

    if (
      !data.date ||
      !data.start_time ||
      !data.end_time
    ) {

      return res.json({
        reply:
          "Please provide date, start time and end time to check availability.",
      });
    }

    const [rows] =
      await db.execute(
        `SELECT hall FROM bookings
         WHERE date = ?
         AND (
           start_time < ?
           AND end_time > ?
         )`,
        [
          data.date,
          data.end_time,
          data.start_time,
        ]
      );

    const bookedHalls =
      rows.map((r) => r.hall);

    const availableHalls =
      validHalls.filter(
        (hall) =>
          !bookedHalls.includes(hall)
      );

    return res.json({
      reply:
        availableHalls.length > 0
          ? `Available halls on ${data.date}: ${availableHalls.join(", ")}`
          : `No halls available on ${data.date}`,
    });
  };

module.exports =
  handleAvailabilityFlow;