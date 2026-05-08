const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function askAI(message) {

  const completion =
    await groq.chat.completions.create({

      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for ConfBook.",
        },
        {
          role: "user",
          content: message,
        },
      ],

      model: "llama-3.3-70b-versatile",
    });

  return completion.choices[0].message.content;
}

module.exports = {
  groq,
  askAI,
};