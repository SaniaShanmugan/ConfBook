const db = require("../db");
const { sendCronEmail } = require("../mailer");

const checkEndedBookings = async () => {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;



   const [endedBookings] = await db.execute(
  `SELECT * FROM bookings 
   WHERE date = ?
AND STR_TO_DATE(CONCAT(date, ' ', end_time), '%Y-%m-%d %H:%i:%s') <= NOW()
AND notified = 0`
, [todayStr]);

    if (!endedBookings.length) return;

    const [allBookings] = await db.execute(
      `SELECT * FROM bookings WHERE date = ?`,
      [todayStr]
    );

    for (const booking of endedBookings) {
   
      const next = allBookings
        .filter(
          (b) =>
            b.hall === booking.hall &&
            b.start_time >= booking.end_time &&
            b.id !== booking.id
        )
        .sort((a, b) => a.start_time.localeCompare(b.start_time))[0];

      if (!next) {
     
        await db.execute(
          "UPDATE bookings SET notified = 1 WHERE id = ?",
          [booking.id]
        );
        continue;
      }

      const isUrgent = next.start_time <= booking.end_time;


      await sendCronEmail({
        toEmail: booking.user_email,
        toName: booking.user_email.split("@")[0],
        title: isUrgent
          ? "Your Meeting Has Ended — Next Team Waiting"
          : "Your Meeting Has Ended — Next Booking Soon",
        message: isUrgent
          ? `Your meeting in ${booking.hall} has ended. The next team is waiting — please vacate immediately.`
          : `Your meeting in ${booking.hall} has ended. The next booking starts soon — please wrap up.`,
        hall: booking.hall,
        date: booking.date,
        time: `${booking.start_time} – ${booking.end_time}`,
        purpose: booking.purpose || "—",
      });

      console.log(`✅ Cron email sent to ${booking.user_email}`);

    
      await db.execute(
        "UPDATE bookings SET notified = 1 WHERE id = ?",
        [booking.id]
      );
    }
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
};

module.exports = checkEndedBookings;