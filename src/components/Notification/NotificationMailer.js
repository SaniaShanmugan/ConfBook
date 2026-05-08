import emailjs from "@emailjs/browser";

const SERVICE_ID  = "service_g3ak0qg";  
const TEMPLATE_ID = "template_f9r6z8l"; 
const PUBLIC_KEY  = "EswgMpzaXOvSDueQt"; 

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