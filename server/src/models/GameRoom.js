const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  name: { type: String, required: true },
  vote: { type: String, default: null }
});

const ChatMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  messageText: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const GameRoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true, uppercase: true },
  hostSocketId: { type: String, required: true },
  status: { type: String, enum: ['LOBBY', 'ACTIVE', 'VOTING'], default: 'LOBBY' },
  questionsRemaining: { type: Number, default: 15 },
  secretKiller: { type: String, required: true },
  players: [PlayerSchema],
  
  // SECREGATED CHAT DATA PIPELINES
  teamChatHistory: [ChatMessageSchema], 
  aiChatHistory: [ChatMessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('GameRoom', GameRoomSchema);