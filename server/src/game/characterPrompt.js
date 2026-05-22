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
    const designatedKiller =
      suspectKeys[Math.floor(Math.random() * suspectKeys.length)];

    const newRoom = new GameRoom({
      roomCode: code,
      status: "LOBBY",
      secretKiller: designatedKiller, // 👈 Save it to the DB permanently
      questionsRemaining: 15,
      cluesUnlocked: [],
    });

    await newRoom.save();

    // Return configuration to frontend (Without revealing the secret killer!)
    res.status(201).json({
      roomCode: code,
      status: "LOBBY",
      questionsRemaining: 15,
    });
  } catch (error) {
    console.error("Error creating game room:", error);
    res.status(500).json({ error: "Failed to initialize game room setup" });
  }
};

// 2. Interrogation Core: Simply reads who the killer is from the database
exports.interrogateSuspect = async (
  roomCode,
  suspectKey,
  questionText,
  senderName,
) => {
  try {
    const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) throw new Error("Game room instance not found.");
    if (room.questionsRemaining <= 0)
      throw new Error("No interrogation attempts remaining.");

    // 👈 Check guilt cleanly by reading what we saved in the DB
    const isThisSuspectTheKiller =
      room.secretKiller === suspectKey.toUpperCase();

    // Fetch prompt template using our true state
    const systemInstruction = getSuspectInstruction(
      suspectKey.toUpperCase(),
      isThisSuspectTheKiller,
    );

    // Reconstruct the chat history context
    let contextualHistory =
      "Here is the log of previous dialogue in this interrogation room:\n";
    room.chatHistory.forEach((log) => {
      contextualHistory += `${log.sender}: ${log.messageText}\n`;
    });

    const compiledPrompt = `
      ${systemInstruction}
      
      ${contextualHistory}
      
      Current Investigator Question from ${senderName}: "${questionText}"
      Respond in character now:
    `;

    const result = await geminiModel.generateContent(compiledPrompt);
    const response = await result.response;
    const suspectReplyText = response.text().trim();

    // Update game states
    room.questionsRemaining -= 1;
    room.chatHistory.push({ sender: senderName, messageText: questionText });
    room.chatHistory.push({
      sender: suspectKey.toUpperCase(),
      messageText: suspectReplyText,
    });

    await room.save();

    return {
      reply: suspectReplyText,
      questionsRemaining: room.questionsRemaining,
    };
  } catch (error) {
    console.error("AI Interrogation pipeline failure:", error);
    throw error;
  }
};

module.exports = { getSuspectInstruction };
