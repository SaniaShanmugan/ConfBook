import { useEffect, useState, useRef } from "react";
import { api, getUser } from "../api";
import NotificationAlert from "../components/Notification/Notification";
import "./Bookings.css";

const TRIGGERED_KEY = "bookings_triggered_notifications";

const toLocalDateTime = (date, time) => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm]  = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

function getPersistedTriggered() {
  try {
    return JSON.parse(localStorage.getItem(TRIGGERED_KEY) || "{}");
  } catch {
    return {};
  }
}

function persistTriggered(obj) {
  try {
    localStorage.setItem(TRIGGERED_KEY, JSON.stringify(obj));
  } catch {}
}

// ── Pre-seed already elapsed alerts so stale ones never fire after refresh ──
function preSeedTriggered(bookings, userId) {
  const now      = new Date();
  const existing = getPersistedTriggered();
  let changed    = false;

  bookings.forEach((b) => {
    if (b.user_id !== userId) return;
    const end = toLocalDateTime(b.date, b.end_time);
    const key = `${b.id}`;

    if (now > end && !existing[key + "_end"]) {
      existing[key + "_end"] = true;
      changed = true;
    }
  });

  if (changed) persistTriggered(existing);
  return existing;
}

function Bookings() {
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState("my");
  const [user, setUser]             = useState(null);
  const [confirmId, setConfirmId]   = useState(null);

  const [selectedHall, setSelectedHall] = useState("Conference Hall A");
  const [selectedDate, setSelectedDate] = useState(null);

  const [activeBookings, setActiveBookings] = useState([]);
  const [alertData, setAlertData]   = useState(null);
  const [alertQueue, setAlertQueue] = useState([]);

  const triggeredRef = useRef(getPersistedTriggered());

  const halls = [
    "Conference Hall A",
    "Conference Hall B",
    "Conference Hall C",
  ];

  const formatTime12 = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${minute} ${ampm}`;
  };

  const loadBookings = async () => {
    setLoading(true);
    const currentUser = getUser();
    setUser(currentUser);

    const data = await api(`/bookings?ts=${Date.now()}`);
    const bookingList = Array.isArray(data) ? data : [];

    if (currentUser && bookingList.length > 0) {
      // ── Pre-seed so stale alerts don't fire on refresh ──
      const seeded = preSeedTriggered(bookingList, currentUser.id);
      triggeredRef.current = seeded;
    }

    setBookings(bookingList);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getActiveBookings = (list) => {
    const now = new Date();
    return list.filter((b) => {
      const start = toLocalDateTime(b.date, b.start_time);
      const end   = toLocalDateTime(b.date, b.end_time);
      return now >= start && now <= end;
    });
  };

  useEffect(() => {
    setActiveBookings(getActiveBookings(bookings));
  }, [bookings]);

  // ── Real-time engine ──
  useEffect(() => {
    if (!bookings.length || !user) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newAlerts = [];

      // ── Update active bookings ──
      setActiveBookings(getActiveBookings(bookings));

      bookings.forEach((b) => {
        if (b.user_id !== user.id) return;

        const end = toLocalDateTime(b.date, b.end_time);
        const key = `${b.id}`;

        // ── Only fire if meeting has truly ended ──
        if (now > end && !triggeredRef.current[key + "_end"]) {
          triggeredRef.current[key + "_end"] = true;
          persistTriggered(triggeredRef.current);

          const next = bookings
            .map((x) => ({
              ...x,
              startDate: toLocalDateTime(x.date, x.start_time),
            }))
            .filter(
              (x) =>
                x.hall === b.hall &&
                x.date === b.date &&
                x.startDate >= end &&
                x.id !== b.id
            )
            .sort((a, b) => a.startDate - b.startDate)[0];

          if (next) {
            newAlerts.push({
              type:    "urgent",
              title:   "Action Required",
              message: "Your meeting has ended. Next team is waiting — vacate immediately.",
              booking: b,
              next:    next,
            });
          } else {
            newAlerts.push({
              type:    "success",
              title:   "Meeting Ended",
              message: "Your meeting has ended. No upcoming bookings for this hall. Thank you!",
              booking: b,
              next:    null,
            });
          }
        }
      });

      if (newAlerts.length) {
        setAlertQueue((prev) => [...prev, ...newAlerts]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [bookings, user]);

  // ── Filter bookings ──
  const now = new Date();

  const baseBookings = bookings.filter((b) => {
    const end = toLocalDateTime(b.date, b.end_time);
    if (end <= now) return false;
    if (view === "my" && b.user_id !== user?.id) return false;
    if (b.hall !== selectedHall) return false;
    return true;
  });

  const availableDates = [
    ...new Set(baseBookings.map((b) => b.date)),
  ].sort((a, b) => new Date(a) - new Date(b));

  const filteredBookings = baseBookings.filter(
    (b) => !selectedDate || b.date === selectedDate
  );

useEffect(() => {

  if (
    !selectedDate ||
    !availableDates.includes(selectedDate)
  ) {

    setSelectedDate(
      availableDates[0] || null
    );
  }

}, [availableDates, selectedDate]);

  const handleDelete = async (id) => {
    await api(`/bookings/${id}`, "DELETE");
    setConfirmId(null);
    loadBookings();
  };

  const formatDate = (date) => {
    const [y, m, d] = date.split("-");
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
      .toLocaleDateString("en-IN", {
        weekday: "short",
        day:     "numeric",
        month:   "short",
      });
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="page dashboard-bookings-page">
  <div className="container dashboard-bookings-container">

        <NotificationAlert
          alertData={alertData}
          alertQueue={alertQueue}
          setAlertData={setAlertData}
          setAlertQueue={setAlertQueue}
        />

        {/* ── Active Bar ── */}
        {activeBookings.length > 0 && (
          <div className="active-bar">
            <span className="active-dot" />
            <span>
              Active:{" "}
              {activeBookings.map((b) => (
                <strong key={b.id}>
                  {b.hall} ({formatTime12(b.start_time)} – {formatTime12(b.end_time)})
                </strong>
              ))}
            </span>
          </div>
        )}

        {/* ── Top Bar ── */}
        <div className="top-bar">
          <h2>Bookings</h2>
          <div className="toggle">
            <button
              className={view === "my" ? "active" : ""}
              onClick={() => setView("my")}
            >
              My
            </button>
            <button
              className={view === "all" ? "active" : ""}
              onClick={() => setView("all")}
            >
              All
            </button>
          </div>
        </div>

        {/* ── Hall Tabs ── */}
        <div className="hall-tabs">
          {halls.map((hall) => (
            <button
              key={hall}
              className={selectedHall === hall ? "active" : ""}
              onClick={() => setSelectedHall(hall)}
            >
              {hall.replace("Conference ", "")}
            </button>
          ))}
        </div>

        {/* ── Date Tabs ── */}
        <div className="date-tabs">
          {availableDates.length ? (
            availableDates.map((date) => (
              <button
                key={date}
                className={selectedDate === date ? "active" : ""}
                onClick={() => setSelectedDate(date)}
              >
                {formatDate(date)}
              </button>
            ))
          ) : (
            <p className="empty">No bookings found</p>
          )}
        </div>

        {/* ── Table ── */}
        {selectedDate && filteredBookings.length ? (
          <div className="hall-section">
            <div className="hall-title">{selectedHall}</div>
            <div className="table">

              {/* ── Header — hides Action column in All view ── */}
              <div className={`table-header ${view === "all" ? "table-header--all" : ""}`}>
                <span>Time</span>
                <span>Booked By</span>
                <span>Purpose</span>
                {view === "my" && <span>Action</span>}
              </div>

              {filteredBookings
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((b) => {
                  const isActive = activeBookings.some((a) => a.id === b.id);
                  return (
                    <div
                      key={b.id}
                      className={`table-row ${view === "all" ? "table-row--all" : ""} ${isActive ? "table-row--active" : ""}`}
                    >
                      <span className="time">
                        {formatTime12(b.start_time)} – {formatTime12(b.end_time)}
                        {isActive && <span className="active-tag">Live</span>}
                      </span>
                      <span className="user">{b.user_email}</span>
                      <span className="purpose">{b.purpose || "—"}</span>
                      {view === "my" && (
                        <button
                          className="cancel-btn"
                          onClick={() => setConfirmId(b.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="empty-state">No bookings found</div>
        )}

        {/* ── Confirm Delete Modal ── */}
        {confirmId && (
          <div className="confirm-overlay">
            <div className="confirm-box">
              <h3 className="alert-title">Cancel Booking?</h3>
              <p className="alert-message">This cannot be undone. The slot will be released.</p>
              <div className="confirm-actions">
                <button className="no" onClick={() => setConfirmId(null)}>
                  Go Back
                </button>
                <button
                  className="alert-ok-btn alert-ok-btn--urgent"
                  style={{ flex: 1 }}
                  onClick={() => handleDelete(confirmId)}
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Bookings;