const { groq } = require("../services/groqService");

async function extractBookingDetails(message) {

  const today = new Date().toISOString().split("T")[0];

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
Today's date is ${today}.

Extract booking details from the user message.

Return ONLY valid JSON. No markdown. No explanation. JSON only.

Format:
{
  "hall": "",
  "date": "",
  "start_time": "",
  "end_time": "",
  "purpose": ""
}

Rules:
- Convert "today" → ${today}
- Convert "tomorrow" → next calendar date after ${today}
- Hall names must ONLY be one of:
  "Conference Hall A"
  "Conference Hall B"
  "Conference Hall C"
- If user says A, B, C or Hall A, Hall B, Hall C → convert to full name
- Date format: YYYY-MM-DD
- Time format: HH:MM in 24-hour format
- Convert 12-hour to 24-hour:
  e.g. "1pm" → "13:00", "12pm" → "12:00", "1am" → "01:00"
- "X to Y" means start_time = X, end_time = Y
- purpose: only extract if explicitly stated as a meeting purpose or reason
  Do NOT set purpose from time expressions or hall names
- If a field is not present in the message → leave it as ""
- Do NOT invent or guess missing values
        `,
      },
      {
        role: "user",
        content: message,
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  const raw = completion.choices[0].message.content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();


  try {
    const data = JSON.parse(raw);

    //  Ensure all fields exist even if AI skips them
    return {
      hall:       data.hall       || "",
      date:       data.date       || "",
      start_time: data.start_time || "",
      end_time:   data.end_time   || "",
      purpose:    data.purpose    || "",
    };
  } catch {
    console.error("❌ JSON parse failed for:", raw);
    return {
      hall:       "",
      date:       "",
      start_time: "",
      end_time:   "",
      purpose:    "",
    };
  }
}

module.exports = extractBookingDetails;