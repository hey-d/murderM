import React, { useState } from "react";
import { Users, Shield, Play, MessageSquare, Terminal } from "lucide-react";

function LobbyPanel({ roomCode, players, hostSocketId, currentSocketId, onStartGame, chatHistory, socket, playerName }) {
  const [lobbyInput, setLobbyInput] = useState("");
  
  // Logical evaluations for permissions
  const isHost = currentSocketId === hostSocketId;
  const canStart = players.length >= 2;

  // Handler to route text into our clean player-to-player communication pipe
  const handleSendLobbyChat = (e) => {
    e.preventDefault();
    if (!lobbyInput.trim() || !socket) return;

    socket.emit("player_chat", {
      senderName: playerName,
      messageText: lobbyInput.trim()
    });
    setLobbyInput("");
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-12 gap-6 animate-fadeIn">
      
      {/* LEFT PANEL: Connected Team Roster Roster Array (5/12 Columns) */}
      <div className="col-span-12 md:col-span-5 bg-cyber-panel border border-cyber-border rounded-xl p-6 shadow-2xl flex flex-col justify-between h-[450px]">
        <div>
          <div className="flex items-center space-x-2 text-cyber-blue border-b border-cyber-border pb-3 mb-4">
            <Users className="w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">
              Personnel Staging Manifest
            </h3>
          </div>

          <div className="text-center bg-cyber-dark/80 border border-cyber-border/60 py-4 rounded-lg mb-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Secure Channel ID</p>
            <h2 className="text-2xl font-black text-cyber-blue tracking-widest">#{roomCode}</h2>
          </div>

          {/* Roster Map Grid */}
          <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
            {players.map((player) => {
              const isPlayerHost = player.socketId === hostSocketId;
              const isMe = player.socketId === currentSocketId;

              return (
                <div
                  key={player.socketId}
                  className={`flex items-center justify-between px-4 py-2.5 rounded border transition-all ${
                    isMe 
                      ? "bg-cyber-blue/5 border-cyber-blue/30 text-white" 
                      : "bg-cyber-dark/40 border-cyber-border/40 text-slate-400"
                  }`}
                >
                  <span className="text-xs font-bold font-mono">
                    {player.name} {isMe && <span className="text-[10px] text-cyber-blue/70 font-normal ml-1">(YOU)</span>}
                  </span>
                  {isPlayerHost && (
                    <div className="flex items-center space-x-1 bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/20 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider">
                      <Shield className="w-2.5 h-2.5" />
                      <span>HOST</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Action Trigger Zone based on Host Matrix Authorization */}
        <div className="border-t border-cyber-border/40 pt-4">
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className={`w-full font-bold py-3 px-4 rounded text-xs tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 border shadow-lg ${
                canStart
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border-green-400/40 shadow-green-500/10"
                  : "bg-slate-900 border-cyber-border text-slate-600 cursor-not-allowed"
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{canStart ? "INITIALIZE INTERROGATION PROTOCOL" : "AWAITING REQUISITE PERSONNEL (MIN 2)"}</span>
            </button>
          ) : (
            <div className="text-center p-3 bg-cyber-dark/60 border border-cyber-border/30 rounded text-[11px] text-slate-500 uppercase tracking-wider animate-pulse flex items-center justify-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-cyber-amber" />
              <span>Awaiting Command Authorization from Host Coordinator...</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Real-time Comms Staging Feed Chat (7/12 Columns) */}
      <div className="col-span-12 md:col-span-7 bg-cyber-panel border border-cyber-border rounded-xl p-6 shadow-2xl flex flex-col justify-between h-[450px]">
        <div className="flex items-center space-x-2 text-cyber-purple border-b border-cyber-border pb-3 mb-3">
          <MessageSquare className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            Secure Tactical Sub-Frequency
          </h3>
        </div>

        {/* Messaging Box Frame */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 text-xs">
          {chatHistory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 italic text-[11px] tracking-wider uppercase">
              Comms terminal clear. Chat with your team while prepping.
            </div>
          ) : (
            chatHistory.map((msg, index) => {
              const isSystem = msg.sender === "SYSTEM";
              return (
                <div
                  key={index}
                  className={`p-2.5 rounded text-mono leading-relaxed border ${
                    isSystem
                      ? "bg-cyber-blue/5 border-cyber-blue/10 text-cyber-blue text-[11px]"
                      : "bg-cyber-dark/60 border-cyber-border/40 text-slate-300"
                  }`}
                >
                  <span className={`font-black uppercase tracking-wider mr-2 text-[10px] ${isSystem ? "text-cyber-blue" : "text-slate-400"}`}>
                    {msg.sender}:
                  </span>
                  <span className="whitespace-pre-wrap">{msg.messageText}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Interactive Chat Form Input */}
        <form onSubmit={handleSendLobbyChat} className="flex space-x-2 border-t border-cyber-border/30 pt-3">
          <input
            type="text"
            value={lobbyInput}
            onChange={(e) => setLobbyInput(e.target.value)}
            placeholder="Type message to staging frequency..."
            className="flex-1 bg-cyber-dark border border-cyber-border rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyber-purple placeholder:text-slate-600 transition-colors"
          />
          <button
            type="submit"
            disabled={!lobbyInput.trim()}
            className="bg-slate-900 border border-slate-700 hover:border-cyber-purple text-slate-400 hover:text-cyber-purple px-4 rounded text-xs transition-colors disabled:opacity-30"
          >
            SEND
          </button>
        </form>
      </div>

    </div>
  );
}

export default LobbyPanel;