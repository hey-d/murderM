const GameRoom = require("../models/GameRoom");
const { getSuspectInstruction } = require("../game/characterPrompt");
const geminiModel = require("../config/aiConfig");

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

// 1. Initializer: Decides and saves the killer ONCE permanently for this room
exports.createRoom = async (req, res) => {
  try {
    const code = generateRoomCode();
    const suspectKeys = ["VANCE", "KAIRO", "UNIT7"];
    
    // Pick the killer randomly right now
    const designatedKiller = suspectKeys[Math.floor(Math.random() * suspectKeys.length)];

    const newRoom = new GameRoom({
      roomCode: code,
      status: "LOBBY",
      secretKiller: designatedKiller, // 👈 Save it to the DB permanently
      questionsRemaining: 15,
      cluesUnlocked: []
    });

    await newRoom.save();

    // Return configuration to frontend (Without revealing the secret killer!)
    res.status(201).json({
      roomCode: code,
      status: "LOBBY",
      questionsRemaining: 15
    });
  } catch (error) {
    console.error("Error creating game room:", error);
    res.status(500).json({ error: "Failed to initialize game room setup" });
  }
};

// 2. Interrogation Core: Simply reads who the killer is from the database
exports.interrogateSuspect = async (roomCode, suspectKey, questionText, senderName) => {
  try {
    // 1. Fetch Room State
    const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) throw new Error("Target instance room not found");

    // 2. CRASH BUG GUARD: Force arrays to handle memory context loops gracefully
    const aiChatHistory = room.aiChatHistory || [];

    // 3. System Instruction Persona Formulation Setup
    let systemInstruction = `You are playing the role of ${suspectKey} in a cyberpunk sci-fi murder mystery game.\n`;
    systemInstruction += `The active suspects are: VANCE (The Butler), SCARLET (The Heiress), and MUSTARD (The Colonel).\n`;
    
    if (room.secretKiller === suspectKey.toUpperCase()) {
      systemInstruction += `SECRET PROTOCOL: You are the secret killer. Deflect suspicion, claim reasonable alibis, and subtly throw suspicion onto either SCARLET or MUSTARD. Never confess instantly.\n`;
    } else {
      systemInstruction += `SECRET PROTOCOL: You are entirely innocent. Defend your file records cleanly and truthfully, and help detectives parse discrepancies.\n`;
    }

    // 4. Trace Conversation Context Records
    let transcriptContext = "\nHere is the ongoing log transcript:\n";
    aiChatHistory.forEach((msg) => {
      transcriptContext += `${msg.sender}: ${msg.messageText}\n`;
    });

    // 5. Query Active Generation Pipe Line
    
    const fullPrompt = `${systemInstruction}\n${transcriptContext}\n${senderName}: ${questionText}\n${suspectKey}:`;
    
    const result = await geminiModel.generateContent(fullPrompt);
    let aiReplyText = result.response.text().trim();

    // Fallback security checks in case token response generation is empty
    if (!aiReplyText) {
      aiReplyText = "My core cognitive links are resetting. Re-send query authorization packet.";
    }

    // 6. Step down parameters state counter values
    if (room.questionsRemaining > 0) {
      room.questionsRemaining -= 1;
    }
    await room.save();

    return {
      reply: aiReplyText,
      questionsRemaining: room.questionsRemaining
    };

  } catch (error) {
    console.error("❌ Controller Engine Interface Error Error:", error);
    return {
      reply: "📡 [COMMS CHANNEL INTERFERENCE]: The suspect's digital feed experienced a packet failure. Try again.",
      questionsRemaining: 15
    };
  }
};