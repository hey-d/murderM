const GameRoom = require("../models/GameRoom");
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
      hostSocketId: socket.id,
      status: "LOBBY",
      questionsRemaining: 15,
      secretKiller: randomKiller,
      players: [{ socketId: socket.id, name: data.name, vote: null }],
      teamChatHistory: [],
      aiChatHistory: [],
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
    // 1. Fetch Room State
    const room = await GameRoom.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) throw new Error("Target instance room not found");

    // 2. CRASH BUG GUARD: Force arrays to handle memory context loops gracefully
    const aiChatHistory = room.aiChatHistory || [];

    // 3. System Instruction Persona Formulation Setup
    let systemInstruction = `You are playing the role of ${suspectKey} in a local house murder mystery game. you will be given the personalities of different players now, you have to be them to reply to the questions when asked to you remember to make your answers and arguments not very long just 2-3 lines and they should sound how people talk in real life, and not ai language\, also remember to reply in whatever the language the detective is using to ask the question n`;
    systemInstruction += `The active suspects are: VANCE (The worker), SCARLET (The Daughter-Heiress), and MUSTARD (The Brother-Ex Colonel)).\n`;

    if (room.secretKiller === suspectKey.toUpperCase()) {
      systemInstruction += `SECRET PROTOCOL: You are the secret killer. Deflect suspicion, claim reasonable alibis, and subtly throw suspicion onto either one of them, giving valid reasons. all the replies of yours should not be very formal or technical it should be how a normal person who is stressed by murder would do, and at times when the situation gets out of the hand behave accordingly Never confess instantly.\n`;
    } else {
      systemInstruction += `SECRET PROTOCOL: You are entirely innocent. Defend your time status and what were you doing at that time maintaing your personality, and help detectives parse discrepancies. remember the tone should be how people talk in normal life\n`;
    }

    // 4. Trace Conversation Context Records
    let transcriptContext = "\nHere is the ongoing log transcript:\n";
    aiChatHistory.forEach((msg) => {
      transcriptContext += `${msg.sender}: ${msg.messageText}\n`;
    });

    let character_personality = `follow these personalities for the suspects if they are being interogated.
    VANCE= being the butler he is a little polite, answers everything buttering the detectives, and a little defensive, comes from a poor family uses this in the conversation very regularly, not very educated as well.

    Scarlet= being the daughter of the victim who is murdered who was a very rich  guy she is very confidendt, clear and clever, she is very articulate and outspoken, she gets her things done and she knows how to get her things done by all the favors i mean all of them.

    Mustard= he is retired colonel, brother of the victim he is arogant man who takes pride in himself, thinks very higly of himself and is often rude he thinks he will be able to get of all the situations, also has a little superiority complex.

    follow their personalites if the respective suspects are being questioned.
    `;

    // 5. Query Active Generation Pipe Line

    const fullPrompt = `${systemInstruction}\n${character_personality}\n${transcriptContext}\n${senderName}: ${questionText}\n${suspectKey}:`;

    const result = await geminiModel.generateContent(fullPrompt);
    let aiReplyText = result.response.text().trim();

    // Fallback security checks in case token response generation is empty
    if (!aiReplyText) {
      aiReplyText =
        "My core cognitive links are resetting. Re-send query authorization packet.";
    }

    // 6. Step down parameters state counter values
    if (room.questionsRemaining > 0) {
      room.questionsRemaining -= 1;
    }
    await room.save();

    return {
      reply: aiReplyText,
      questionsRemaining: room.questionsRemaining,
    };
  } catch (error) {
    console.error("❌ Controller Engine Interface Error Error:", error);
    return {
      reply:
        "📡 [COMMS CHANNEL INTERFERENCE]: The suspect's digital feed experienced a packet failure. Try again.",
      questionsRemaining: 15,
    };
  }
};
