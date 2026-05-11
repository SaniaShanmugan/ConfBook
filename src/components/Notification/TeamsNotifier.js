const TEAMS_WEBHOOK_URL =
  import.meta.env.VITE_TEAMS_WEBHOOK_URL;
  
export const sendTeamsDM = async ({ email, title, message, hall, time }) => {
  try {
    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `**${title}**\n\n${message}\n\n**Hall:** ${hall}\n**Time:** ${time}\n**To:** ${email}`,
      }),
    });
    console.log("Teams notification sent");
  } catch (err) {
    console.error(" Teams notification failed:", err);
  }
};