const TEAMS_WEBHOOK_URL = "https://emergertechpvt.webhook.office.com/webhookb2/d4aa9445-963b-487d-aa60-33857104c075@98b1f027-18b1-47d1-82f8-f07a9e46b9f2/IncomingWebhook/97a4a67e6ebc4a7e95204805da885683/4e0878cb-9080-43aa-a977-93a8e53ea7e0/V2eSSY-xO-N9-_hKFH2ZIjVv5DawTRY03MkPaDad5ENiA1";

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