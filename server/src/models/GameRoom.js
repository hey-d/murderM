const mongoose = require("mongoose");

const GameRoomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  status: {
    type: String,
    enum: ["LOBBY", "ACTIVE", "COMPLETED"],
    default: "LOBBY",
  },
  secretKiller: { type: String, required: true },
  questionsRemaining: {
    type: Number,
    detault: 15,
  },
  cluesUnlocked: [
    { type: String }
 ],
  investigators: [
    {
        socketId: {type: String, required: true},
        name: {type: String, default: "Anonymous Detective"}
    }
  ],
  chatHistory: [
    {
        sender: {type: String, required: true},
        messageText: {type: String, required: true},
        timestamp: {type: Date, default: Date.now}
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400
  }
});

module.exports = mongoose.model("GameRoom", GameRoomSchema);
