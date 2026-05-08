import { useEffect, useState } from "react";
import "./AIAssistant.css";

function AIAssistant() {

  const [open, setOpen] = useState(false);

  const [message, setMessage] =
    useState("");

  // ─────────────────────────────────────────
  // LOAD CHAT HISTORY
  // ─────────────────────────────────────────
  const [messages, setMessages] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "ai_chat_history"
        );

      return saved
        ? JSON.parse(saved)
        : [
            {
              role: "ai",
              text:
                "Hi 👋 I’m your booking assistant.",
            },
          ];
    });

  // ─────────────────────────────────────────
  // SAVE CHAT HISTORY
  // ─────────────────────────────────────────
  useEffect(() => {

    localStorage.setItem(
      "ai_chat_history",
      JSON.stringify(messages)
    );

  }, [messages]);

  // ─────────────────────────────────────────
  // CLEAR ONLY ON PAGE REFRESH
  // ─────────────────────────────────────────
  useEffect(() => {

    const clearChat = () => {
      localStorage.removeItem(
        "ai_chat_history"
      );
    };

    window.addEventListener(
      "beforeunload",
      clearChat
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        clearChat
      );
    };

  }, []);

  // ─────────────────────────────────────────
  // SEND MESSAGE
  // ─────────────────────────────────────────
  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMsg = {
      role: "user",
      text: message,
    };

    // Add user message instantly
    setMessages((prev) => [
      ...prev,
      userMsg,
    ]);

    const currentMessage = message;

    setMessage("");

    try {

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/ai/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },

          body: JSON.stringify({
            message: currentMessage,
          }),
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply,
        },
      ]);

    } catch {

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "AI unavailable right now.",
        },
      ]);
    }
  };

  return (
    <>

      {/* Floating Button */}
      <button
        className="ai-float-btn"
        onClick={() =>
          setOpen(!open)
        }
      >
        ✨
      </button>

      {/* Chat Box */}
      {open && (

        <div className="ai-chatbox">

          {/* Header */}
          <div className="ai-header">
            AI Assistant
          </div>

          {/* Messages */}
          <div className="ai-messages">

            {messages.map((msg, i) => (

              <div
                key={i}
                className={`ai-message ${msg.role}`}
              >
                {msg.text}
              </div>

            ))}

          </div>

          {/* Input Area */}
          <div className="ai-input-area">

            <input
              type="text"
              placeholder="Ask something..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  sendMessage();
                }

              }}
            />

            <button
              onClick={sendMessage}
            >
              Send
            </button>

          </div>

        </div>

      )}

    </>
  );
}

export default AIAssistant;