import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, ShieldAlert, Users, MessageSquare } from "lucide-react";

function Terminal({ chatHistory, activeSuspect, roomCode, playerName, socket, questionsRemaining }) {
  const [activeTab, setActiveTab] = useState("SUSPECT"); // "SUSPECT" or "TEAM"
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll logic: Keeps dialogue containers snapped to the latest message entry
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    
    if (chatHistory.length > 0) {
      const latestMessage = chatHistory[chatHistory.length - 1];
      if (latestMessage.sender === activeSuspect) {
        setIsProcessing(false);
      }
    }
  }, [chatHistory, activeSuspect]);

  // Handle sudden suspect tab switches gracefully
  useEffect(() => {
    setIsProcessing(false);
  }, [activeSuspect]);

  // Form Submission Handler: Dispatches payloads based on active frequency configurations
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    if (activeTab === "SUSPECT") {
      // Channel Alpha: Direct AI Interrogation
      if (questionsRemaining <= 0) return;
      setIsProcessing(true);

      socket.emit("interrogate_suspect", {
        roomCode,
        suspectKey: activeSuspect,
        questionText: inputMessage.trim(),
        senderName: playerName
      });
    } else {
      // Channel Beta: Private Player Strategy Whisper Hub
      socket.emit("player_chat", {
        senderName: playerName,
        messageText: inputMessage.trim()
      });
    }

    setInputMessage("");
  };

  // Dynamic filter array sorting out the messages based on active dashboard views
  const filteredMessages = chatHistory.filter((msg) => {
    const isTeamMsg = msg.sender.startsWith("[TEAM]");
    const isSystemMsg = msg.sender === "SYSTEM";
    const isAISuspect = ["VANCE", "KAIRO", "UNIT7"].includes(msg.sender);

    if (activeTab === "TEAM") {
      // Team frequencies only carry investigator strategic chats and system broadcasts
      return isTeamMsg || isSystemMsg;
    } else {
      // Interrogation feeds show AI answers or questions asked specifically to the active suspect
      if (isSystemMsg) return true; // Keep connection alerts visible
      if (isTeamMsg) return false;   // Hide internal strategy from the AI feed
      if (isAISuspect) return msg.sender === activeSuspect;
      return true; // Keep player inquiries visible
    }
  });

  const getSenderColorClass = (sender) => {
    if (sender === "SYSTEM") return "text-cyan-400 border-cyan-500/10 bg-cyan-950/5 font-bold";
    if (sender.startsWith("[TEAM]")) return "text-purple-400 border-purple-500/20 bg-purple-950/10";
    
    switch (sender) {
      case "VANCE": return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case "KAIRO": return "text-purple-400 border-purple-500/20 bg-purple-500/5";
      case "UNIT7": return "text-green-400 border-green-500/20 bg-green-500/5";
      default: return "text-slate-300 border-slate-700 bg-slate-900/40"; // Normal player questions
    }
  };

  return (
    <div className="w-full bg-cyber-panel border border-cyber-border rounded-xl h-[520px] flex flex-col justify-between overflow-hidden relative shadow-xl">
      
      {/* UPPER CONTROLS: Dual Frequency Mode Selector Buttons Grid */}
      <div className="grid grid-cols-2 border-b border-cyber-border bg-cyber-dark/80 p-1 gap-1">
        <button
          onClick={() => setActiveTab("SUSPECT")}
          className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all duration-300 ${
            activeTab === "SUSPECT"
              ? "bg-gradient-to-r from-amber-950/40 to-cyan-950/40 border border-cyber-blue text-white glow-blue"
              : "text-slate-500 hover:text-slate-300 border border-transparent"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>[ SUSPECT INTERROGATION ]</span>
        </button>
        <button
          onClick={() => setActiveTab("TEAM")}
          className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all duration-300 ${
            activeTab === "TEAM"
              ? "bg-purple-950/40 border border-cyber-purple text-white glow-purple"
              : "text-slate-500 hover:text-slate-300 border border-transparent"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>[ INVESTIGATOR SECURE COMMS ]</span>
        </button>
      </div>

      {/* FEED CONTROLLER PANEL: Meta context info tags strip */}
      <div className="bg-black/40 px-4 py-2 border-b border-cyber-border/40 flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-wider">
        <span>MODE: {activeTab === "SUSPECT" ? `DIRECT COMB-LINK FEED // TARGET: ${activeSuspect}` : "TEAM LOCAL RADAR ENCRYPTION"}</span>
        <span className="animate-pulse text-cyber-blue">● FREQUENCY STANDBY</span>
      </div>

      {/* DIALOGUE FEED STREAM VIEWPORT */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs font-mono">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 text-center">
            <MessageSquare className="w-7 h-7 opacity-30 animate-pulse" />
            <p className="tracking-widest uppercase text-[10px]">
              {activeTab === "SUSPECT" 
                ? `Secure intercept matrix empty. Initiate query line for ${activeSuspect}.` 
                : "Private strategist encrypted bandwidth clear."}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const isSystem = msg.sender === "SYSTEM";
            const isTeam = msg.sender.startsWith("[TEAM]");
            const isAI = ["VANCE", "KAIRO", "UNIT7"].includes(msg.sender);

            return (
              <div
                key={index}
                className={`p-3 border rounded-lg transition-all duration-300 max-w-[85%] ${getSenderColorClass(msg.sender)} ${
                  isAI || isSystem ? "mr-auto" : "ml-auto"
                }`}
              >
                <div className="font-black uppercase tracking-wider mb-1 text-[9px] opacity-70 flex justify-between">
                  <span>{msg.sender}</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">{msg.messageText}</p>
              </div>
            );
          })
        )}

        {/* Streaming AI Thinking state indicator */}
        {activeTab === "SUSPECT" && isProcessing && (
          <div className={`p-3 border rounded-lg mr-auto max-w-[85%] border-cyan-500/10 bg-cyan-950/5 animate-pulse text-cyber-blue`}>
            <div className="font-black uppercase tracking-wider mb-1 text-[9px] opacity-60">
              SYS STATUS: DECRYPTING COGNITIVE SYNAPSES
            </div>
            <div className="flex space-x-1 items-center py-1">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* BOTTOM CONTROL INTERACTIVE FORM FOOTER */}
      <form onSubmit={handleFormSubmit} className="border-t border-cyber-border bg-cyber-dark/80 p-3 flex items-center space-x-2">
        <input
          type="text"
          disabled={activeTab === "SUSPECT" && (isProcessing || questionsRemaining <= 0)}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            activeTab === "SUSPECT" && questionsRemaining <= 0
              ? "INTERROGATION POOL EXHAUSTED // FILE TERMINATED"
              : activeTab === "SUSPECT"
              ? `Send data inquiry query string straight to ${activeSuspect}...`
              : "Type encrypted private strategic message to your investigator crew..."
          }
          className={`flex-1 bg-cyber-panel border rounded px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all duration-300 disabled:opacity-40 ${
            activeTab === "TEAM" ? "focus:border-cyber-purple border-cyber-border/60" : "focus:border-cyber-blue border-cyber-border/60"
          }`}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || (activeTab === "SUSPECT" && (isProcessing || questionsRemaining <= 0))}
          className={`p-3 rounded border transition-all duration-300 bg-slate-900 text-slate-400 disabled:opacity-20 ${
            activeTab === "TEAM" 
              ? "hover:border-cyber-purple hover:text-cyber-purple border-slate-700" 
              : "hover:border-cyber-blue hover:text-cyber-blue border-slate-700"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}

export default Terminal;