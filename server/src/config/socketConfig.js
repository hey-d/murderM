const { Server } = require("socket.io");
const { interrogateSuspect } = require("../controllers/gameController");
const { createRoom } = require("../controllers/gameController")
const GameRoom = require("../models/GameRoom");
const dotenv  = require('dotenv')
dotenv.config();

const allowedOrigin = process.env.FRONTEND_URL

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket linked: ${socket.id}`);

    // =========================================================================
    // 🎲 EVENT 0: Room Creation (Reverted to 3 Suspects)
    // =========================================================================
    socket.on("create_room", async (data, callback) => {
      try {
        const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        // 🛠️ REVERTED BACK TO YOUR ORIGINAL 3 SUSPECTS ONLY
        const suspectsPool = ["VANCE", "SCARLET", "MUSTARD"];
        const randomKiller = suspectsPool[Math.floor(Math.random() * suspectsPool.length)];

        const newRoom = new GameRoom({
          roomCode: generatedCode,
          hostSocketId: socket.id,
          status: "LOBBY",
          questionsRemaining: 15,
          secretKiller: randomKiller,
          players: [{ socketId: socket.id, name: data.name, vote: null }],
          teamChatHistory: [],
          aiChatHistory: []
        });

        const savedRoom = await newRoom.save();
        socket.join(generatedCode);

        if (typeof callback === "function") {
          callback({ success: true, roomCode: generatedCode, isHost: true });
        }

        io.to(generatedCode).emit("room_state_update", {
          status: savedRoom.status,
          players: savedRoom.players,
          hostSocketId: savedRoom.hostSocketId,
          questionsRemaining: savedRoom.questionsRemaining
        });

      } catch (err) {
        console.error("❌ create_room error:", err);
        if (typeof callback === "function") callback({ success: false });
      }
    });

    // =========================================================================
    // 👤 EVENT 1: Room Join Sync Matrix
    // =========================================================================
    const handleJoinLogic = async (data, callback) => {
      const targetRoomCode = data.roomCode ? data.roomCode.toUpperCase() : null;
      const username = data.username || data.name; 
      
      if (!targetRoomCode || !username) {
        if (typeof callback === "function") callback({ success: false });
        return;
      }
      
      try {
        const room = await GameRoom.findOne({ roomCode: targetRoomCode });
        if (!room) {
          socket.emit("room_error", "Room not found.");
          if (typeof callback === "function") callback({ success: false });
          return;
        }

        await socket.join(targetRoomCode);

        let playerExists = room.players.find(p => p.name === username);
        if (!playerExists) {
          room.players.push({ socketId: socket.id, name: username, vote: null });
        } else {
          playerExists.socketId = socket.id;
        }

        const updatedRoom = await room.save();
        const isHost = updatedRoom.hostSocketId === socket.id;

        if (typeof callback === "function") {
          callback({ success: true, isHost: isHost });
        }

        io.to(targetRoomCode).emit("receive_team_chat", {
          sender: "SYSTEM",
          messageText: `📡 [ANNOUNCEMENT]: "${username}" joined the channel.`,
          timestamp: new Date()
        });

        io.to(targetRoomCode).emit("room_state_update", {
          status: updatedRoom.status,
          players: updatedRoom.players,
          hostSocketId: updatedRoom.hostSocketId,
          questionsRemaining: updatedRoom.questionsRemaining
        });

        socket.emit("historical_sync", {
          status: updatedRoom.status,
          teamChatHistory: updatedRoom.teamChatHistory || [],
          aiChatHistory: updatedRoom.aiChatHistory || [],
          questionsRemaining: updatedRoom.questionsRemaining
        });

      } catch (err) {
        console.error("❌ join error:", err);
      }
    };

    socket.on("join_game", (data) => handleJoinLogic(data));
    socket.on("join_room", (data, callback) => handleJoinLogic(data, callback));

    // =========================================================================
    // 💬 EVENT 2: Team Private Comms Track
    // =========================================================================
    socket.on("player_chat", async (data) => {
      const { senderName, messageText, roomCode } = data;
      const activeRoomCode = (roomCode || Array.from(socket.rooms)[1] || "").toUpperCase();
      if (!activeRoomCode) return;

      const playerChatPayload = { sender: senderName, messageText, timestamp: new Date() };

      try {
        const room = await GameRoom.findOne({ roomCode: activeRoomCode });
        if (room) {
          room.teamChatHistory.push(playerChatPayload);
          await room.save();
          io.to(activeRoomCode).emit("receive_team_chat", playerChatPayload);
        }
      } catch (err) {
        console.error(err);
      }
    });

    // =========================================================================
    // 🧠 EVENT 3: AI Suspect Interrogation Terminal
    // =========================================================================
    socket.on("interrogate_suspect", async (data) => {
      const { roomCode, suspectKey, questionText, senderName } = data;
      const targetRoom = roomCode.toUpperCase();
      
      try {
        const room = await GameRoom.findOne({ roomCode: targetRoom });
        if (!room || room.status !== "ACTIVE" || room.questionsRemaining <= 0) return;

        const playerMsg = { sender: senderName.toUpperCase(), messageText: questionText, timestamp: Date.now()};
        room.aiChatHistory.push(playerMsg);
        io.to(targetRoom).emit("receive_ai_chat", playerMsg);

        const aiResult = await interrogateSuspect(targetRoom, suspectKey, questionText, senderName);

        const suspectMsg = { sender: suspectKey.toUpperCase(), messageText: aiResult.reply, timestamp: Date.now() };
        room.aiChatHistory.push(suspectMsg);
        room.questionsRemaining = aiResult.questionsRemaining;

        if (room.questionsRemaining <= 0) {
          await setTimeout(10000);
          room.status = "VOTING";
        }
        await room.save();

        io.to(targetRoom).emit("receive_ai_chat", suspectMsg);
        
        // Broadcast question counter drop down to all active instances
        io.to(targetRoom).emit("room_state_update", {
          status: room.status,
          players: room.players,
          hostSocketId: room.hostSocketId,
          questionsRemaining: room.questionsRemaining
        });

        if (room.status === "VOTING") {
          io.to(targetRoom).emit("voting_triggered", { status: room.status });
        }

      } catch (error) {
        console.error(error);
      }
    });

    // =========================================================================
    // 🎬 EVENT 4: Start Game
    // =========================================================================
    socket.on("start_game", async (data) => {
      const activeRoomCode = (data?.roomCode || Array.from(socket.rooms)[1] || "").toUpperCase();
      try {
        const room = await GameRoom.findOne({ roomCode: activeRoomCode });
        if (!room || room.hostSocketId !== socket.id) return;

        room.status = "ACTIVE";
        await room.save();

        io.to(activeRoomCode).emit("game_started", {
          status: room.status,
          questionsRemaining: room.questionsRemaining
        });
      } catch (err) {
        console.error(err);
      }
    });

    // =========================================================================
    // 🗳️ EVENT 5: Ballot Submission Handling Engine
    // =========================================================================
    socket.on("cast_vote", async (data) => {
      const { accusedSuspect, roomCode } = data;
      const activeRoomCode = (roomCode || Array.from(socket.rooms)[1] || "").toUpperCase();

      try {
        const room = await GameRoom.findOne({ roomCode: activeRoomCode });
        // FIXED: Allow voting to process during BOTH 'ACTIVE' and 'VOTING' modes so sidebar buttons click
        if (!room || (room.status !== "VOTING" && room.status !== "ACTIVE")) return;

        const voter = room.players.find(p => p.socketId === socket.id);
        if (!voter) return;

        voter.vote = accusedSuspect.toUpperCase();
        await room.save();

        // FIXED: Explicitly sync the overall state changes down to trigger color changes on buttons
        io.to(activeRoomCode).emit("vote_registered", { players: room.players });
        io.to(activeRoomCode).emit("room_state_update", {
          status: room.status,
          players: room.players,
          hostSocketId: room.hostSocketId,
          questionsRemaining: room.questionsRemaining
        });

        const totalVoted = room.players.filter(p => p.vote !== null).length;
        if (totalVoted === room.players.length) {
          const voteCounts = {};
          room.players.forEach(p => { voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1; });

          let majoritySuspect = "";
          let maxVotes = 0;
          Object.entries(voteCounts).forEach(([suspect, count]) => {
            if (count > maxVotes) { maxVotes = count; majoritySuspect = suspect; }
          });

          const isVictorious = majoritySuspect === room.secretKiller;

          room.status = "VOTING"; // Stay in voting screen context to see final splash
          room.questionsRemaining = 15; 
          room.teamChatHistory = [];       
          room.aiChatHistory = [];       
          room.players.forEach(p => p.vote = null); 
          await room.save();

          io.to(activeRoomCode).emit("game_over_verdict", {
            victory: isVictorious,
            actualKiller: room.secretKiller,
            accusedByTeam: majoritySuspect,
            message: isVictorious
              ? `🎉 OPERATION SUCCESSFUL! ${majoritySuspect} was convicted.`
              : `❌ OPERATION FAILED! Culprit was ${room.secretKiller}.`
          });
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnecting", async () => {
      const activeRoomCode = Array.from(socket.rooms)[1];
      if (!activeRoomCode) return;
      try {
        const room = await GameRoom.findOne({ roomCode: activeRoomCode.toUpperCase() });
        if (!room) return;
        room.players = room.players.filter(p => p.socketId !== socket.id);
        await room.save();
        io.to(activeRoomCode).emit("room_state_update", {
          status: room.status, players: room.players, hostSocketId: room.hostSocketId, questionsRemaining: room.questionsRemaining
        });
      } catch (e) {}
    });
  });

  return io;
};

module.exports = setupSocket;