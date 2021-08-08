const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");

router.post("/", async (req, res) => {
  console.log("welcome to creating converstaion route");

  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.recieverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const foundConversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });

    res.status(200).json(foundConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
