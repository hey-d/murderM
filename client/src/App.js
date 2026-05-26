import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const acessurl = "https://murderm-backend.onrender.com";
const socket = io(acessurl);

function App() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Core Sync States
  const [players, setPlayers] = useState([]);
  const [roomStatus, setRoomStatus] = useState("LOBBY");
  const [questionsRemaining, setQuestionsRemaining] = useState(15);
  const [teamMessages, setTeamMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);

  // UI Panels / Views
  const [showIntroCards, setShowIntroCards] = useState(false);
  const [currentIntroIndex, setCurrentIntroIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  // Inputs
  const [teamInput, setTeamInput] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [selectedSuspect, setSelectedSuspect] = useState("VANCE");

  // The Original 3 Suspects Pool
  const suspectsProfile = [
    {
      key: "VANCE",
      role: "The Butler",
      img: "/vance.png",
      bio: "In charge of the manor archives. Deep access to security data logs.",
    },
    {
      key: "SCARLET",
      role: "The Heiress",
      img: "/Scarlett.png",
      bio: "Stands to inherit the estate's entire decentralized token pool.",
    },
    {
      key: "MUSTARD",
      role: "The Colonel",
      img: "/mustard.png",
      bio: "Tactical defense expert. Knows every surveillance blind spot.",
    },
  ];

  useEffect(() => {
    socket.on("room_state_update", (roomData) => {
      setPlayers(roomData.players || []);
      setRoomStatus(roomData.status || "LOBBY");
      setQuestionsRemaining(roomData.questionsRemaining ?? 15);
    });

    socket.on("game_started", (data) => {
      setRoomStatus(data.status);
      setQuestionsRemaining(data.questionsRemaining);
      setGameResult(null);
      setCurrentIntroIndex(0);
      setShowIntroCards(true);
    });

    socket.on("receive_team_chat", (msg) => {
      setTeamMessages((prev) => [...prev, msg]);
    });

    socket.on("receive_ai_chat", (msg) => {
      setAiMessages((prev) => [...prev, msg]);
    });

    socket.on("voting_triggered", (data) => {
      setRoomStatus("VOTING");
    });

    socket.on("vote_registered", (data) => {
      setPlayers(data.players || []);
    });

    socket.on("game_over_verdict", (data) => {
      setGameResult(data);
      setRoomStatus("VOTING");
    });

    socket.on("historical_sync", (history) => {
      setRoomStatus(history.status);
      setTeamMessages(history.teamChatHistory || []);
      setAiMessages(history.aiChatHistory || []);
      setQuestionsRemaining(history.questionsRemaining ?? 15);
    });

    return () => {
      socket.off("room_state_update");
      socket.off("game_started");
      socket.off("receive_team_chat");
      socket.off("receive_ai_chat");
      socket.off("voting_triggered");
      socket.off("vote_registered");
      socket.off("game_over_verdict");
      socket.off("historical_sync");
    };
  }, []);

  const handleCreateRoom = () => {
    if (!username.trim()) return alert("Identify yourself, Investigator.");
    socket.emit("create_room", { name: username }, (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
        setIsHost(response.isHost);
        setInRoom(true);
      }
    });
  };

  const handleJoinRoom = () => {
    if (!username.trim() || !roomCode.trim()) return alert("Missing markers.");
    socket.emit("join_room", { roomCode, name: username }, (response) => {
      if (response.success) {
        setIsHost(response.isHost);
        setInRoom(true);
      }
    });
  };

  const sendTeamMessage = (e) => {
    e.preventDefault();
    if (!teamInput.trim()) return;
    socket.emit("player_chat", {
      senderName: username,
      messageText: teamInput,
      roomCode,
    });
    setTeamInput("");
  };

  const sendInterrogation = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    socket.emit("interrogate_suspect", {
      roomCode,
      suspectKey: selectedSuspect,
      questionText: aiInput,
      senderName: username,
    });
    setAiInput("");
  };

  const submitBallot = (suspectKey) => {
    socket.emit("cast_vote", { accusedSuspect: suspectKey, roomCode });
  };

  if (!inRoom) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#0f172a",
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "30px",
            borderRadius: "8px",
            width: "400px",
            border: "1px solid #38bdf8",
          }}
        >
          <h2 style={{ textAlign: "center", color: "#38bdf8" }}>🕵️‍♂️ MurderM</h2>
          <input
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              background: "#0f172a",
              border: "1px solid #475569",
              color: "#fff",
            }}
            type="text"
            placeholder="OPERATOR HANDLE"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            style={{
              width: "100%",
              padding: "12px",
              background: "#38bdf8",
              color: "#0f172a",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              marginBottom: "15px",
            }}
            onClick={handleCreateRoom}
          >
            CREATE ROOM
          </button>
          <div style={{ display: "flex", gap: "5px" }}>
            <input
              style={{
                width: "60%",
                padding: "10px",
                background: "#0f172a",
                border: "1px solid #475569",
                color: "#fff",
              }}
              type="text"
              placeholder="4-LETTER PIN"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <button
              style={{
                width: "40%",
                background: "transparent",
                border: "1px solid #38bdf8",
                color: "#38bdf8",
                cursor: "pointer",
              }}
              onClick={handleJoinRoom}
            >
              JOIN ROOM
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (roomStatus?.toUpperCase() === "LOBBY") {
    return (
      <div
        style={{
          padding: "40px",
          backgroundColor: "#0f172a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "monospace",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "30px",
            width: "600px",
            borderRadius: "6px",
            border: "1px solid #475569",
          }}
        >
          <h3>
            📍 OPERATION FREQUENCY:{" "}
            <span style={{ color: "#38bdf8" }}>{roomCode}</span>
          </h3>
          <p>Roster Manifest ({players.length} Investigators Linked):</p>
          <div
            style={{
              background: "#0f172a",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            {players.map((p) => (
              <div key={p.socketId} style={{ padding: "5px 0" }}>
                • {p.name}
              </div>
            ))}
          </div>
          {isHost ? (
            <button
              style={{
                width: "100%",
                padding: "15px",
                background: "#22c55e",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => socket.emit("start_game", { roomCode })}
            >
              ⚡ START GAME
            </button>
          ) : (
            <p style={{ textAlign: "center", color: "#eab308" }}>
              ⏳ Awaiting host coordination authorization signal...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (showIntroCards) {
    const card = suspectsProfile[currentIntroIndex];
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#090d16",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontFamily: "monospace",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: "#111726",
            border: "2px solid #ef4444",
            padding: "30px",
            width: "450px",
            textAlign: "center",
            borderRadius: "8px",
          }}
        >
          <span
            style={{ fontSize: "12px", color: "#ef4444", letterSpacing: "2px" }}
          >
            🚨 SUSPECT[{currentIntroIndex + 1}/3]
          </span>
          <div
            style={{
              width: "150px",
              height: "150px",
              margin: "20px auto",
              background: "#1e293b",
              overflow: "hidden",
              borderRadius: "50%",
              border: "2px solid #ef4444",
            }}
          >
            <img
              src={card.img}
              alt={card.key}
              style={{ width: "120%", height: "100%", objectFit: "fill" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <h2 style={{ margin: "5px 0" }}>{card.key}</h2>
          <h4 style={{ color: "#f87171", marginTop: 0 }}>{card.role}</h4>
          <p
            style={{
              padding: "15px",
              background: "#090d16",
              minHeight: "80px",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            {card.bio}
          </p>
          <button
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "10px 25px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => {
              if (currentIntroIndex < suspectsProfile.length - 1)
                setCurrentIntroIndex((prev) => prev + 1);
              else setShowIntroCards(false);
            }}
          >
            {currentIntroIndex === suspectsProfile.length - 1
              ? "LAUNCH CONSOLE"
              : "NEXT IN LINE →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row", // ⭐ THIS LINE
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "#fff",
        fontFamily: "monospace",
        overflow: isMobile ? "auto" : "hidden",
        position: "relative",
      }}
    >
      {/* LEFT SIDE PANEL: ROSTER + LIVE PLAYER BALLOTS */}
      {/* LEFT SIDE PANEL: ROSTER + LIVE PLAYER BALLOTS */}
      <div
        style={{
          width: isMobile ? "100%" : "280px",
          background: "#1e293b",
          borderRight: isMobile ? "none" : "1px solid #334155",
          borderBottom: isMobile ? "1px solid #334155" : "none",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          zIndex: 10,
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: "#38bdf8" }}>PIN: {roomCode}</h3>
          <small style={{ color: "#94a3b8" }}>QUERIES REMAINING:</small>
          <div
            style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b" }}
          >
            {questionsRemaining}
          </div>
        </div>

        <hr
          style={{ border: "0", borderTop: "1px solid #334155", width: "100%" }}
        />

        <div style={{ flex: 1, overflowY: "auto" }}>
          <h5
            style={{
              margin: "0 0 10px",
              color: "#94a3b8",
              letterSpacing: "1px",
            }}
          >
            INVESTIGATOR MATRIX:
          </h5>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {players.map((p) => (
              <div
                key={p.socketId}
                style={{
                  background: "#0f172a",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #334155",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                    🟢 {p.name}
                  </span>
                  {p.socketId === socket.id && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#38bdf8",
                        background: "#0f172a",
                        padding: "2px 5px",
                        borderRadius: "3px",
                        border: "1px solid #38bdf8",
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
                <div style={{ marginTop: "5px", fontSize: "12px" }}>
                  <span style={{ color: "#64748b" }}>Accusing: </span>
                  {p.vote ? (
                    <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                      🚨 {p.vote}
                    </span>
                  ) : (
                    <span style={{ color: "#22c55e", fontStyle: "italic" }}>
                      Evaluating Intel...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR MINI RUNTIME VOTING PANEL */}
        <div
          style={{
            background: "#111827",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #475569",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            LIVE ACCUSATION SELECTION:
          </span>
          <div style={{ display: "flex", gap: "5px" }}>
            {["VANCE", "SCARLET", "MUSTARD"].map((suspect) => {
              const myCurrentVote = players.find(
                (p) => p.socketId === socket.id,
              )?.vote;
              const isSelected = myCurrentVote === suspect;
              return (
                <button
                  key={suspect}
                  onClick={() => submitBallot(suspect)}
                  style={{
                    flex: 1,
                    padding: "6px 2px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    background: isSelected ? "#ef4444" : "#334155",
                    color: isSelected ? "#fff" : "#cbd5e1",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "3px",
                  }}
                >
                  {suspect}
                </button>
              );
            })}
          </div>
        </div>

        <button
          style={{
            width: "100%",
            padding: "12px",
            background: isChatOpen ? "#ef4444" : "#38bdf8",
            color: "#0f172a",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
          }}
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          {isChatOpen ? "❌ CLOSE TEAM CHAT" : "💬 OPEN TEAM STRATEGY"}
        </button>
      </div>

      {/* OVERLAY CHAT DRAWER */}
      {/* OVERLAY CHAT DRAWER */}
      {isChatOpen && (
        <div
          style={{
            position: isMobile ? "fixed" : "absolute",
            top: 0,
            left: isMobile ? 0 : "280px",
            width: isMobile ? "100%" : "320px",
            height: "100%",
            background: "#111827",
            borderRight: "1px solid #38bdf8",
            display: "flex",
            flexDirection: "column",
            padding: "15px",
            zIndex: 20,
            boxShadow: isMobile ? "none" : "10px 0 15px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #38bdf8",
              paddingBottom: "10px",
              marginBottom: "10px",
            }}
          >
            <span style={{ fontWeight: "bold", color: "#38bdf8" }}>
              🔒 TEAM INTEL FREQUENCY
            </span>
            <button
              style={{
                background: "none",
                border: "none",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              onClick={() => setIsChatOpen(false)}
            >
              ✕
            </button>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              background: "#000",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "10px",
            }}
          >
            {teamMessages.map((m, i) => (
              <p key={i} style={{ margin: "5px 0", fontSize: "13px" }}>
                <strong style={{ color: "#38bdf8" }}>{m.sender}:</strong>{" "}
                {m.messageText}
              </p>
            ))}
          </div>
          <form
            onSubmit={sendTeamMessage}
            style={{ display: "flex", gap: "5px" }}
          >
            <input
              style={{
                flex: 1,
                padding: "8px",
                background: "#1e293b",
                border: "1px solid #475569",
                color: "#fff",
              }}
              type="text"
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              placeholder="Type encryption data..."
            />
            <button
              style={{
                padding: "8px",
                background: "#38bdf8",
                color: "#000",
                border: "none",
                fontWeight: "bold",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* MAIN WORKSPACE REGION */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "#0f172a",
        }}
      >
        {roomStatus === "VOTING" ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px",
            }}
          >
            {gameResult ? (
              <div
                style={{
                  background: "#1e293b",
                  padding: "40px",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: "2px solid #38bdf8",
                  maxWidth: "600px",
                }}
              >
                <h2>
                  {gameResult.victory ? "🎉 CASE RESOLVED" : "❌ CASE COLD"}
                </h2>
                <p style={{ fontSize: "18px", padding: "20px 0" }}>
                  {gameResult.message}
                </p>
                <button
                  style={{
                    padding: "12px 30px",
                    background: "#38bdf8",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  onClick={() => window.location.reload()}
                >
                  RETURN TO HQ
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <h2 style={{ color: "#ef4444", letterSpacing: "2px" }}>
                  🚨 ALL QUERIES EXHAUSTED: LOCK IN ACCUSATIONS
                </h2>
                <p>
                  Final voting block activated. Confirm target criminal file
                  below:
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "25px",
                    marginTop: "30px",
                    flexWrap: isMobile ? "wrap" : "nowrap",
                    justifyContent: isMobile ? "center" : "flex-start",
                  }}
                >
                  {suspectsProfile.map((s) => (
                    <div
                      key={s.key}
                      style={{
                        background: "#1e293b",
                        width: isMobile ? "100%" : "220px",
                        padding: "20px",
                        border: "1px solid #475569",
                        borderRadius: "6px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          margin: "0 auto 15px",
                          background: "#0f172a",
                          overflow: "hidden",
                          borderRadius: "50%",
                          border: "1px solid #ef4444",
                        }}
                      >
                        <img
                          src={s.img}
                          alt={s.key}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                      <h3>{s.key}</h3>
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {s.role}
                      </p>
                      <button
                        style={{
                          width: "100%",
                          marginTop: "15px",
                          padding: "10px",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        onClick={() => submitBallot(s.key)}
                      >
                        CAST ULTIMATE BALLOT
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* INITIAL RESTORED MAIN GRID WORKSPACE */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "20px",
              gap: "20px",
              overflowY: "auto",
              paddingBottom: isMobile ? "80px" : "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "15px",
              }}
            >
              {suspectsProfile.map((s) => (
                <div
                  key={s.key}
                  onClick={() => setSelectedSuspect(s.key)}
                  style={{
                    flex: 1,
                    background: "#1e293b",
                    padding: "15px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border:
                      selectedSuspect === s.key
                        ? "2px solid #ef4444"
                        : "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      background: "#0f172a",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "1px solid #475569",
                    }}
                  >
                    <img
                      src={s.img}
                      alt={s.key}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        color: selectedSuspect === s.key ? "#ef4444" : "#fff",
                      }}
                    >
                      {s.key}
                    </h4>
                    <small style={{ color: "#94a3b8" }}>{s.role}</small>
                  </div>
                </div>
              ))}
            </div>

            {/* AI DIALOGUE FEED */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background: "#111827",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                padding: "15px",
                overflow: "visible",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #ef4444",
                  paddingBottom: "10px",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#ef4444" }}>
                  🧠 SECURE COMMS LINK // INTERROGATING: {selectedSuspect}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px",
                  background: "#000",
                  borderRadius: "4px",
                  marginBottom: "10px",
                  paddingBottom: isMobile ? "70px" : "10px",
                }}
              >
                {aiMessages.map((m, i) => {
                  const isSuspect = ["VANCE", "SCARLET", "MUSTARD"].includes(
                    m.sender,
                  );
                  return (
                    <div
                      key={i}
                      style={{
                        margin: "10px 0",
                        paddingLeft: "10px",
                        borderLeft: isSuspect
                          ? "2px solid #ef4444"
                          : "2px solid #22c55e",
                      }}
                    >
                      <strong
                        style={{ color: isSuspect ? "#ef4444" : "#22c55e" }}
                      >
                        {m.sender}:
                      </strong>
                      <p
                        style={{
                          margin: "3px 0 0",
                          color: "#e2e8f0",
                          fontSize: "14px",
                        }}
                      >
                        {m.messageText}
                      </p>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={sendInterrogation}
                style={{
                  display: "flex",
                  gap: "5px",
                  background: isMobile ? "#111827" : "transparent",
                  padding: isMobile ? "10px" : "0",
                  borderTop: isMobile ? "1px solid #ef4444" : "none",
                }}
              >
                <input
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#1e293b",
                    border: "1px solid #475569",
                    color: "#fff",
                  }}
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={`Submit query to ${selectedSuspect}...`}
                />
                <button
                  style={{
                    padding: "0 25px",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  SUBMIT QUERY
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
