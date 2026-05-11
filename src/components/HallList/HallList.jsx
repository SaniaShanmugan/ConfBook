import "./HallList.css";
import { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import { api, getUser } from "../../api";

import imgA from "../../assets/A.jpg";
import imgB from "../../assets/B.jpg";
import imgC from "../../assets/C.jpg";

function HallList({ selectedDate, startTime, endTime }) {
  const [bookings, setBookings] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHall, setSelectedHall] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 🔹 Convert AM/PM → 24-hour format
  const to24Hour = (time) => {
    if (!time) return "";

    if (!time.includes("AM") && !time.includes("PM")) return time;

    const [t, modifier] = time.split(" ");
    let [hours, minutes] = t.split(":");
    hours = parseInt(hours);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  // 🔹 Format time → AM/PM
  const formatTime12 = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${minute} ${ampm}`;
  };

  // 🔹 Static halls
  const halls = [
    { name: "Conference Hall A", img: imgA, capacity: "12 Guests", amenities: ["Projector", "Wi-Fi"] },
    { name: "Conference Hall B", img: imgB, capacity: "25 Guests", amenities: ["Whiteboard", "Smart TV"] },
    { name: "Conference Hall C", img: imgC, capacity: "40 Guests", amenities: ["Sound System", "Mic"] },
  ];

  // 🔹 Load bookings
  const loadBookings = async () => {
    const data = await api("/bookings");
    if (!Array.isArray(data)) {
      setErrorMsg("Failed to load bookings");
      return;
    }
    setBookings(data);
  };

  useEffect(() => {
    if (selectedDate) loadBookings();
  }, [selectedDate]);

  // 🔹 Open modal
  const openModal = (hallName) => {
    setSelectedHall(hallName);
    setModalOpen(true);
  };

  //  Normalize date
 const getSafeDate = (dateStr) => {
  return dateStr;
};

  //  Confirm booking
  const confirmBooking = async (purpose) => {
    setMessage("");
    setErrorMsg("");

    const user = getUser();
    if (!user) {
      setErrorMsg("User not logged in");
      return;
    }

    const safeDate = getSafeDate(selectedDate);

    const data = await api("/bookings", "POST", {
      hall: selectedHall,
      date: safeDate,
      start_time: to24Hour(startTime),  
      end_time: to24Hour(endTime),      
      purpose: purpose || "",
    });

    if (data.error) {
      setErrorMsg(data.error);
      return;
    }

    setMessage("Booking confirmed");
    setTimeout(() => setMessage(""), 3000);

    await loadBookings();
    setModalOpen(false);
  };


  const isOverlapping = (start1, end1, start2, end2) => {
    return start1 < end2 && end1 > start2;
  };

  return (
    <>
      <div className="hall-container">
        {message && <div className="success-msg">{message}</div>}
        {errorMsg && <div className="error-msg">{errorMsg}</div>}

        <div className="hall-grid">
          {halls.map((hall, index) => {

            const safeDate = getSafeDate(selectedDate);
            const start = to24Hour(startTime);
            const end = to24Hour(endTime);

            const hallBookings = bookings.filter(
              (b) => b.hall === hall.name && b.date === safeDate
            );

            const overlappingBooking = hallBookings.find((b) =>
              isOverlapping(start, end, b.start_time, b.end_time)
            );

            const isBooked = !!overlappingBooking;

            return (
              <div key={index} className={`hall-card ${isBooked ? "is-booked" : ""}`}>

                <div className="hall-image-wrapper">
                  <img src={hall.img} alt={hall.name} className="hall-img" />
                  <div className={`status-badge ${isBooked ? "booked" : "available"}`}>
                    {isBooked ? "Booked" : "Available"}
                  </div>
                </div>

                <div className="hall-content">
                  <div className="hall-info-top">
                    <h3>{hall.name}</h3>
                    <span className="capacity">{hall.capacity}</span>
                  </div>

                  <div className="amenities-list">
                    {hall.amenities.map((item, i) => (
                      <span key={i} className="tag">{item}</span>
                    ))}
                  </div>

                  {isBooked && (
                    <div className="conflict-box">
                      <p>
                        Booked by <strong>{overlappingBooking.user_email}</strong>
                      </p>
                      <span>
                        {formatTime12(overlappingBooking.start_time)} -{" "}
                        {formatTime12(overlappingBooking.end_time)}
                      </span>
                      {overlappingBooking.purpose && (
                        <div className="purpose-tag">
                          {overlappingBooking.purpose}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    className={`book-btn ${isBooked ? "disabled" : ""}`}
                    disabled={isBooked}
                    onClick={() => openModal(hall.name)}
                  >
                    {isBooked ? "Unavailable" : "Book Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmBooking}
        data={{
          hall: selectedHall,
          date: selectedDate,
          startTime,
          endTime,
        }}
      />
    </>
  );
}

export default HallList;