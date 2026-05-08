import { useEffect, useRef } from "react";
import { sendNotificationEmail } from "./NotificationMailer";
import { sendTeamsDM } from "./TeamsNotifier";
import "./Notification.css";

const formatTime12 = (time) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
};

const formatDateDisplay = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

function NotificationAlert({ alertData, alertQueue, setAlertData, setAlertQueue }) {
  const audioRef     = useRef(null);
  const isPlayingRef = useRef(false);
  const emailSentRef = useRef({});

  useEffect(() => {
    if (!alertData && alertQueue.length > 0) {
      const [next, ...rest] = alertQueue;
      setAlertData(next);
      setAlertQueue(rest);
    }
  }, [alertData, alertQueue]);

  useEffect(() => {
    if (!alertData) return;

    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.volume = 1.0;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }

    if ((alertData.type === "urgent" || alertData.type === "info") && alertData.next) {
      const emailKey = `${alertData.booking.id}_${alertData.type}_email`;
      if (!emailSentRef.current[emailKey]) {
        emailSentRef.current[emailKey] = true;
        const sendEmailToUserA = async () => {
          try {
            await sendNotificationEmail({
              toEmail: alertData.booking.user_email,
              toName:  alertData.booking.user_email.split("@")[0],
              title:   alertData.type === "urgent"
                ? "Your Meeting Has Ended — Next Team Waiting"
                : "Your Meeting Has Ended — Next Booking Soon",
              message: alertData.type === "urgent"
                ? `Your meeting in ${alertData.booking.hall} has ended. The next team is waiting — please vacate the hall immediately.`
                : `Your meeting in ${alertData.booking.hall} has ended. The next booking starts soon — please wrap up and vacate.`,
              hall:    alertData.booking.hall,
              date:    formatDateDisplay(alertData.booking.date),
              time:    `${formatTime12(alertData.booking.start_time)} – ${formatTime12(alertData.booking.end_time)}`,
              purpose: alertData.booking.purpose || "—",
            });
            await sendTeamsDM({
              email:   alertData.booking.user_email,
              title:   alertData.type === "urgent"
                ? "Your Meeting Has Ended — Next Team Waiting"
                : "Your Meeting Has Ended — Next Booking Soon",
              message: alertData.type === "urgent"
                ? `Your meeting in ${alertData.booking.hall} has ended. The next team is waiting — please vacate immediately.`
                : `Your meeting in ${alertData.booking.hall} has ended. The next booking starts soon — please wrap up.`,
              hall:    alertData.booking.hall,
              time:    `${formatTime12(alertData.booking.start_time)} – ${formatTime12(alertData.booking.end_time)}`,
            });
              await fetch(`http://localhost:5000/api/bookings/${alertData.booking.id}/notified`, {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
              });
            console.log(` Email + Teams sent to: ${alertData.booking.user_email}`);
          } catch (err) {
            console.error(" Failed:", err);
          }
        };
        sendEmailToUserA();
      }
    }
  }, [alertData]);

  const handleCloseAlert = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.muted = true;
    }
    isPlayingRef.current = false;
    setAlertData(null);
  };

  if (!alertData) return null;

  return (
    <>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" muted />
      <div className="confirm-overlay">
        <div className="confirm-box">

          <h3 className="alert-title">{alertData.title}</h3>
          <p className="alert-message">{alertData.message}</p>

          {alertData.next && (
            <p className="next-booking-info">
              Next: {formatTime12(alertData.next.start_time)} – {formatTime12(alertData.next.end_time)}
            </p>
          )}

          {alertQueue.length > 0 && (
            <span className="queue-count">
              +{alertQueue.length} more
            </span>
          )}

          <button className="alert-ok-btn" onClick={handleCloseAlert}>
            OK, Got it
          </button>

        </div>
      </div>
    </>
  );
}

export default NotificationAlert;