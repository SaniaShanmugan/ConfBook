const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const db      = require("../db");

const router  = express.Router();

router.post("/register", async (req, res) => {

  const { email, password } = req.body;

  // 🔥 Restrict company domain
  if (!email.endsWith("@emergertech.com")) {
    return res.status(400).json({
      error: "Please use your EmergerTech email address"
    });
  }

  try {

    const hashed = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashed]
    );

    res.json({
      message: "Account created"
    });

  } catch (err) {

    console.error(err);

    res.status(400).json({
      error: "Email already exists"
    });
  }
});

router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    // 🔥 Extra safety
    if (!rows[0].email.endsWith("@emergertech.com")) {
      return res.status(403).json({
        error: "Unauthorized domain"
      });
    }

    const valid = await bcrypt.compare(
      password,
      rows[0].password
    );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: rows[0].id,
        email: rows[0].email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user: {
        id: rows[0].id,
        email: rows[0].email
      }
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

module.exports = router;