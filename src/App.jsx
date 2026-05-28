import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import { useState, useEffect } from "react";

import Navbar from "./components/Navbar/Navbar";
import Calendar from "./components/Calendar/Calendar";
import Slots from "./pages/Slots";
import Bookings from "./pages/Bookings";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import AIAssistant from "./components/AIAssistant/AIAssistant";

import { getUser } from "./api";

function AppContent() {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="app-loader">
        Loading...
      </div>
    );
  }

  return (
    <div className="app-layout">

      {/* Navbar */}
      {location.pathname !== "/login" && (
        <Navbar user={user} setUser={setUser} />
      )}

      {/* Main Pages */}
      <main className="app-main">

        <Routes>

          <Route
            path="/login"
            element={<Login setUser={setUser} />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute user={user} loading={loading}>

                <div style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  gap: "24px",
                  padding: "24px",
                  alignItems: "stretch",
                  width: "100%",
                  boxSizing: "border-box",
                  minWidth: 0
                }}>

                  {/* LEFT SIDE - Bookings */}
                  <div style={{
                    flex: "1 1 400px",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    <Bookings />
                  </div>

                  {/* RIGHT SIDE - Calendar */}
                  <div style={{
                    width: "340px",
                    flex: "0 0 340px",
                    position: "sticky",
                    top: "90px"
                  }}>
                    <Calendar />
                  </div>

                </div>

              </ProtectedRoute>
            }
          />

          <Route
            path="/slots/:date"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Slots />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Bookings />
              </ProtectedRoute>
            }
          />

        </Routes>

      </main>

      {/* AI Assistant */}
      {location.pathname !== "/login" && (
        <AIAssistant />
      )}

    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;