const express = require("express");
const router = express.Router();
const Meeting = require("../models/Meeting");
const User = require("../models/User");

router.post("/create", async (req, res) => {
  const { creatorId, partnerId, roomName } = req.body;

  try {
    // Check if any meeting with same roomName exists (regardless of status)
    let existing = await Meeting.findOne({ roomName });

    if (existing) {
      if (existing.status === "active") {
        // Meeting is already running, return it
        return res.status(200).json(existing);
      }
    }

    // If no meeting exists with same roomName, create it
    const newMeeting = new Meeting({
      creatorId,
      partnerId,
      roomName,
      status: "active",
    });

    await newMeeting.save();

    res.status(201).json(newMeeting);
  } catch (error) {
    console.error("Error creating meeting:", error.message);
    res.status(500).json({ message: "Error creating meeting" });
  }
});


router.get("/active/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const activeMeeting = await Meeting.findOne({
      $or: [{ creatorId: userId }, { partnerId: userId }],
      status: "active",
    });

    if (!activeMeeting)
      return res.status(404).json({ message: "No active meeting" });

    res.status(200).json(activeMeeting);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving meeting" });
  }
});

router.post("/end", async (req, res) => {
  const { roomName } = req.body;

  try {
    await Meeting.findOneAndUpdate({ roomName }, { status: "ended" });
    res.status(200).json({ message: "Meeting ended" });
  } catch (error) {
    res.status(500).json({ message: "Error ending meeting" });
  }
});

module.exports = router;
