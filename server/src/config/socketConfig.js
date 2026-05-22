const { Server } = require("socket.io");
const { interrogateSuspect } = require("../controllers/gameController"); // 👈 Bug Fixed: Corrected spelling

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`user connected with the id ${socket.id}`);

    // Track the active room for this specific socket connection closure
    let currentRoom = null;

    socket.on("join_game", (roomCode) => {
      currentRoom = roomCode; // 👈 Store it locally so disconnect can use it
      socket.join(roomCode);
      
      // Fix: .emit() needs an event name string as the first argument, not a raw template literal message string
      socket.to(roomCode).emit("player_announcement", `user ${socket.id} joined the game`);
    });

    socket.on("interrogate_suspect", async (data) => {
      const { roomCode, suspectKey, questionText, senderName } = data;
      try {
        // Fix: Typo correction to match "receive_chat" spacing convention for consistency
        io.to(roomCode).emit("receive_chat", {
          sender: senderName,
          messageText: questionText,
          timestamp: new Date()
        });
        
        const aiResult = await interrogateSuspect(roomCode, suspectKey, questionText, senderName);

        io.to(roomCode).emit("suspect_replied", {
          sender: suspectKey.toUpperCase(),
          messageText: aiResult.reply,
          questionsRemaining: aiResult.questionsRemaining,
          timestamp: new Date() // 👈 Bug Fixed: Removed duplicate timestamp key
        });
      } catch (error) {
        console.error("socket interrogation error:", error);
        socket.emit("interrogation_error", { error: "Failed to process interrogation. Please try again." });
      }
    });

    socket.on('disconnect', () => {
      if (currentRoom) {
        socket.to(currentRoom).emit("player_announcement", `user ${socket.id} left the game`); // 👈 Bug Fixed: Won't crash anymore
      }
      console.log(`user disconnected with the id ${socket.id}`);
    });
  });

  return io;
};

module.exports = setupSocket;