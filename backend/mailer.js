const emailjs = require("@emailjs/nodejs");

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

  const formatDateDisplay = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  };
  const sendCronEmail = async ({
  toEmail, toName, title, message, hall, date, time, purpose
}) => {
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: toEmail,
        to_name:  toName || "Team",
        title,
        message,
        hall,
        date:    formatDateDisplay(date), 
        time,
        purpose: purpose || "—",
      },
      { publicKey: PUBLIC_KEY }
    );
    console.log(`✅ Email sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
};

module.exports = { sendCronEmail };