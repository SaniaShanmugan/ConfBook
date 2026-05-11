import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendNotificationEmail = async ({
  toEmail,
  toName,
  title,
  message,
  hall,
  date,
  time,
  purpose,
}) => {
  try {
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: toEmail,
        to_name:  toName  || "Team",
        title:    title,
        message:  message,
        hall:     hall,
        date:     date,
        time:     time,
        purpose:  purpose || "—",
      },
      PUBLIC_KEY
    );
    console.log(" Email sent:", result.text);
    return true;
  } catch (error) {
    console.error("Email failed:", error);
    return false;
  }
};