import { useEffect, useState } from "react";
import { api, getUser } from "../api";
import "./Home.css";
import Calendar from "../components/Calendar/Calendar";

function Home() {
  const [totalBookings, setTotalBookings] = useState(0);

  const userStr = localStorage.getItem("user");
  const user    = userStr ? JSON.parse(userStr) : null;
  const displayName = user?.email?.split("@")[0] || "User";

  useEffect(() => {
    const loadTotal = async () => {
      const currentUser = getUser();
      if (!currentUser) return;

      const data = await api("/bookings");
      if (Array.isArray(data)) {
        const myBookings = data.filter((b) => b.user_id === currentUser.id);
        setTotalBookings(myBookings.length);
      }
    };
    loadTotal();
  }, []);

  return (
    <div className="home-page">

      <div className="home-header">
        <div>
          <h2 className="home-title">Welcome back</h2>
          <p className="home-sub">Manage your conference hall bookings</p>
        </div>

        <div className="home-user-pill">
          <div className="home-user-avatar">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <span>{displayName}</span>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon blue"></div>
          <div>
            <p className="stat-value">{totalBookings}</p>
            <p className="stat-label">My Bookings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"></div>
          <div>
            <p className="stat-value">3</p>
            <p className="stat-label">Halls Available</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple"></div>
          <div>
            <p className="stat-value">7</p>
            <p className="stat-label">Slots Per Day</p>
          </div>
        </div>

      </div>

      <div className="calendar-section">
        <div className="calendar-header-box">
          <h3>Select a Date</h3>
          <p>Choose a day to view available slots</p>
        </div>

        <div className="calendar-body">
          <Calendar />
        </div>
      </div>

    </div>
  );
}

export default Home;