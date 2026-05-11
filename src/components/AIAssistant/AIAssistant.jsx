import {
  useEffect,
  useState,
  useRef,
} from "react";

import "./AIAssistant.css";

function AIAssistant() {

  const [open, setOpen] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const bottomRef = useRef(null);

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
  // AUTO SCROLL
  // ─────────────────────────────────────────
  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

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

    if (!message.trim() || loading)
      return;

    const userMsg = {
      role: "user",
      text: message,
    };

    // ADD USER MESSAGE
    setMessages((prev) => [
      ...prev,
      userMsg,
    ]);

    const currentMessage = message;

    setMessage("");

    setLoading(true);

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
          text:
            data.reply ||
            "No response from AI.",
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

    } finally {

      setLoading(false);

    }
  };

  return (
    <>

      {/* FLOATING BUTTON */}
      <button
        className="ai-float-btn"
        onClick={() =>
          setOpen(!open)
        }
      >
        ✨
      </button>

      {/* CHAT BOX */}
      {open && (

        <div className="ai-chatbox">

          {/* HEADER */}
          <div className="ai-header">
            AI Assistant
          </div>

          {/* MESSAGES */}
          <div className="ai-messages">

            {messages.map((msg, i) => (

              <div
                key={i}
                className={`ai-message ${msg.role}`}
              >
                {msg.text}
              </div>

            ))}

            {/* AUTO SCROLL TARGET */}
            <div ref={bottomRef}></div>

          </div>

          {/* INPUT AREA */}
          <div className="ai-input-area">

            <input
              type="text"
              placeholder="Ask something..."
              value={message}
              disabled={loading}
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
              disabled={loading}
            >
              {loading
                ? "..."
                : "Send"}
            </button>

          </div>

        </div>

      )}

    </>
  );
}

export default AIAssistant;