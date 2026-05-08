import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./Calendar.css";

function Calendar() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);

  const year        = currentDate.getFullYear();
  const month       = currentDate.getMonth();
  const monthName   = currentDate.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();

  // ✅ FIXED: local date instead of toISOString (no timezone bug)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // ✅ FIXED: no cache + no conversion
  const loadBookedDates = async () => {
    const data = await api(`/bookings/dates?ts=${Date.now()}`); // 🔥 prevent cache

    if (Array.isArray(data)) {
      setBookedDates(data); // use directly
    } else {
      setBookedDates([]);
    }
  };

  useEffect(() => {
    loadBookedDates();
  }, [currentDate]);

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
    setSelectedDay(null);
  };

  const handleClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    navigate(`/slots/${dateStr}`);
  };

  return (
    <div className="calendar-page-wrapper">
      <div className="calendar-container">

        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)} className="nav-btn">‹</button>
          <h2>{monthName} <span>{year}</span></h2>
          <button onClick={() => changeMonth(1)} className="nav-btn">›</button>
        </div>

        <div className="weekday-labels">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="date-grid">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell empty" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const isToday  = dateStr === todayStr;
            const isPast   = dateStr < todayStr;
            const isBooked = bookedDates.includes(dateStr);

            return (
              <div
                key={day}
                className={`day-cell ${isToday ? "today" : ""} ${isPast ? "past" : ""} ${selectedDay === day ? "selected" : ""}`}
                onClick={() => {
                  if (isPast) return;
                  setSelectedDay(day);
                  handleClick(day);
                }}
              >
                <span>{day}</span>

                {isBooked && <div className="dot" />}
              </div>
            );
          })}
        </div>

        <div className="calendar-footer">
          <button onClick={() => changeMonth(-12)}>Prev Year</button>

          <button
            className="primary"
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDay(null);
            }}
          >
            Today
          </button>

          <button onClick={() => changeMonth(12)}>Next Year</button>
        </div>

      </div>
    </div>
  );
}

export default Calendar;