const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const aiRoutes = require("./routes/ai");

const checkEndedBookings = require("./cron/notifyEnded");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/ai", aiRoutes);

// ── Run every minute ──
cron.schedule("* * * * *", () => {
  console.log("🔄 Checking ended bookings...");
  checkEndedBookings();
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});