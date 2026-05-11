import React, { useEffect, useState } from "react";
import { api } from "../../api";
import "./SlotSelector.css";

function SlotSelector({ selectedSlot, setSelectedSlot, selectedDate }) {
  const [bookings, setBookings] = useState([]);

  const slots = [
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
  ];

  const halls = [
    "Conference Hall A",
    "Conference Hall B",
    "Conference Hall C",
  ];

  //  Load bookings
  const loadBookings = async () => {
    const data = await api(`/bookings/date/${selectedDate}`);
    if (Array.isArray(data)) {
      setBookings(data);
    }
  };

  useEffect(() => {
    if (selectedDate) loadBookings();
  }, [selectedDate]);


  const isOverlapping = (slot, booking) => {
    return slot.start < booking.end_time && slot.end > booking.start_time;
  };

  // COUNT BOOKINGS IN SLOT
  const getBookingCount = (slot) => {
    return bookings.filter((b) => isOverlapping(slot, b)).length;
  };

  // SLOT STATUS
  const getSlotStatus = (slot) => {
    const count = getBookingCount(slot);
    if (count === 0) return "available";
    if (count < halls.length) return "partial";
    return "full";
  };

  const availableSlots = slots.filter(
    (slot) => getSlotStatus(slot) !== "full"
  ).length;

  return (
    <div className="slot-section">
      <div className="slot-header">
        <h3 className="slot-label">Select Available Time</h3>
        <span className="slot-count">
          {availableSlots} Slots Available
        </span>
      </div>

      <div className="slot-row">
        {slots.map((slot) => {
          const label    = `${slot.start} - ${slot.end}`;
          const isActive = selectedSlot === label;
          const status   = getSlotStatus(slot);

          return (
            <button
              key={label}
              className={`slot-pill ${isActive ? "active" : ""} ${status}`}
              onClick={() => setSelectedSlot(label)}
              disabled={status === "full"}
            >
              <span className="status-indicator"></span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SlotSelector;