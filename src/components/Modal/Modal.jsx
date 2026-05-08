import React, { useState } from "react";
import "./Modal.css";

function Modal({ open, onClose, onConfirm, data = {} }) {
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    if (!purpose.trim()) {
      setError("Please enter purpose");
      return;
    }

    setError("");
    onConfirm(purpose); 
    setPurpose("");     // reset after confirm
  };

  // DATE FORMAT → 24 Apr 2026
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const [y, m, d] = dateStr.split("-");
      if (!y || !m || !d) return dateStr;
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
        .toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric"
        });
    };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Confirm Booking</h2>
          <p>Review your reservation details before confirming</p>
        </div>

        <div className="modal-details-card">

          <div className="detail-item">
            <span className="label">Venue</span>
            <span className="value">{data.hall}</span>
          </div>

          <div className="detail-item">
            <span className="label">Date</span>
            <span className="value">{formatDate(data.date)}</span>
          </div>

          <div className="detail-item">
            <span className="label">Time</span>
            <span className="value">
              {data.startTime && data.endTime
                ? `${data.startTime} - ${data.endTime}`
                : "Not selected"}
            </span>
          </div>

        </div>

        {/* 🔥 PURPOSE INPUT */}
        <div className="purpose-section">
          <label>Purpose</label>
          <input
            type="text"
            placeholder="Enter purpose of booking"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="modal-actions">
          <button className="btn-modal cancel" onClick={onClose}>
            Cancel
          </button>

          <button className="btn-modal confirm" onClick={handleConfirm}>
            Confirm Booking
          </button>
        </div>

      </div>
    </div>
  );
}

export default Modal;