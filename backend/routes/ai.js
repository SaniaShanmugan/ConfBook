const express = require("express");

const auth =
  require("../middleware/auth");

const detectIntent =
  require("../services/intentService");

const {
  askAI,
} = require("../services/groqService");

const handleBookingFlow =
  require("../services/ai/bookingFlow");

const handleCancelFlow =
  require("../services/ai/cancelFlow");

const handleAvailabilityFlow =
  require("../services/ai/availabilityFlow");

const handleModifyFlow =
  require("../services/ai/modifyFlow");

const {
  pendingBookings,
  pendingConfirmations,
  pendingCancels,
  pendingCancelConfirmations,
  pendingModify,
  pendingModifyConfirmations,
} = require("../services/ai/pendingStore");

const router = express.Router();

router.post(
  "/chat",
  auth,
  async (req, res) => {

    try {

      const { message } = req.body;

      if (!message?.trim()) {

        return res.status(400).json({
          reply: "Message required",
        });
      }

      const userId =
        req.user.id;

      // ─────────────────────────
      // ACTIVE BOOKING FLOW
      // ─────────────────────────
      if (
        pendingBookings[userId] ||
        pendingConfirmations[userId]
      ) {

        return handleBookingFlow(
          req,
          res
        );
      }

      // ─────────────────────────
      // ACTIVE CANCEL FLOW
      // ─────────────────────────
      if (
        pendingCancels[userId] ||
        pendingCancelConfirmations[userId]
      ) {

        return handleCancelFlow(
          req,
          res
        );
      }

      // ─────────────────────────
      // ACTIVE MODIFY FLOW
      // ─────────────────────────
      if (
        pendingModify[userId] ||
        pendingModifyConfirmations[userId]
      ) {

        return handleModifyFlow(
          req,
          res
        );
      }

      // ─────────────────────────
      // DETECT INTENT
      // ─────────────────────────
      const intent =
        detectIntent(message);

      // ─────────────────────────
      // BOOK
      // ─────────────────────────
      if (intent === "BOOK") {

        return handleBookingFlow(
          req,
          res
        );
      }

      // ─────────────────────────
      // CANCEL
      // ─────────────────────────
      if (intent === "CANCEL") {

        return handleCancelFlow(
          req,
          res
        );
      }

      // ─────────────────────────
      // MODIFY
      // ─────────────────────────
      if (intent === "MODIFY") {

        return handleModifyFlow(
          req,
          res
        );
      }

      // ─────────────────────────
      // AVAILABILITY
      // ─────────────────────────
      if (
        intent ===
        "CHECK_AVAILABILITY"
      ) {

        return handleAvailabilityFlow(
          req,
          res
        );
      }

      // ─────────────────────────
      // NORMAL AI CHAT
      // ─────────────────────────
      const reply =
        await askAI(message);

      return res.json({
        reply,
      });

    } catch (err) {

      console.error(
        "AI Error:",
        err
      );

      return res.status(500).json({
        reply:
          "AI failed to respond.",
      });
    }
  }
);

module.exports = router;