import { useParams } from "react-router-dom";
import { useState } from "react";
import HallList from "../components/HallList/HallList";
import "./Slots.css";

function Slots() {
  const { date } = useParams();

  const [start, setStart] = useState({ hour: "", min: "00", period: "AM" });
  const [end, setEnd] = useState({ hour: "", min: "00", period: "AM" });

  const formatDate = (d) => {
    const [year, month, day] = d.split("-");
    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // 🔥 Convert to 24h for backend
  const to24 = ({ hour, min, period }) => {
    if (!hour) return "";
    let h = parseInt(hour);

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${min}`;
  };

  const startTime = to24(start);
  const endTime = to24(end);

  const isValid = startTime && endTime && startTime < endTime;

  const displayTime = (t) => {
    if (!t.hour) return "";
    return `${t.hour}:${t.min} ${t.period}`;
  };

  return (
    <div className="slots-page">

      <div className="slots-card">

        {/* HEADER */}
        <div className="top-section">
          <div>
            <h2>{formatDate(date)}</h2>
            <p>Select your preferred time range</p>
          </div>

          {isValid && (
            <div className="time-badge">
              {displayTime(start)} → {displayTime(end)}
            </div>
          )}
        </div>

        {/* TIME SELECTOR */}
        <div className="time-grid">

          {/* START */}
          <div className="time-box">
            <label>Start Time</label>

            <div className="time-select">
              <select onChange={(e) => setStart({ ...start, hour: e.target.value })}>
                <option value="">HH</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </select>

              <select onChange={(e) => setStart({ ...start, min: e.target.value })}>
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>

              <select onChange={(e) => setStart({ ...start, period: e.target.value })}>
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>

          {/* END */}
          <div className="time-box">
            <label>End Time</label>

            <div className="time-select">
              <select onChange={(e) => setEnd({ ...end, hour: e.target.value })}>
                <option value="">HH</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </select>

              <select onChange={(e) => setEnd({ ...end, min: e.target.value })}>
                {["00", "15", "30", "45"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>

              <select onChange={(e) => setEnd({ ...end, period: e.target.value })}>
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>

        </div>

        {!isValid && start.hour && end.hour && (
          <p className="error">End time must be greater</p>
        )}

        {/* HALL LIST */}
        {isValid ? (
          <HallList
            selectedDate={date}
            startTime={startTime}
            endTime={endTime}
          />
        ) : (
          <div className="empty">
            Select time to view halls
          </div>
        )}

      </div>
    </div>
  );
}

export default Slots;