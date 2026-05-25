import React, { useState } from "react";
import axios from "axios";
import { Terminal, PlusCircle, LogIn, ShieldAlert } from "lucide-react";

function Lobby({ onJoinSuccess }) {
  const [inputCode, setInputCode] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler A: Spin up a completely fresh game room via our backend API
  const handleCreateGame = async () => {
    if (!username.trim()) {
      setError("CRITICAL: INVESTIGATOR IDENTITY REQUIRED BEFORE ACCESS");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Direct post call to your clean updated route endpoint
      const response = await axios.post("https://murderm-backend.onrender.com/api/game/create");
      const { roomCode } = response.data;
      
      // Hand the established state configurations up to App.js
      onJoinSuccess(roomCode, username);
    } catch (err) {
      console.error(err);
      setError("NETWORK EXCEPTION: FAILED TO GENESIS NEW CASE FILE");
    } finally {
      setLoading(false);
    }
  };

  // Handler B: Connect to a pre-existing active terminal instance
  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("CRITICAL: INVESTIGATOR IDENTITY REQUIRED BEFORE ACCESS");
      return;
    }
    if (inputCode.length !== 4) {
      setError("MALFORMED TARGET: ROOM CODE MUST BE EXACTLY 4 CHARACTERS");
      return;
    }

    setError("");
    // Standardize casing to match our database indexing parameters
    onJoinSuccess(inputCode.toUpperCase(), username);
  };

  return (
    <div className="w-full max-w-md bg-cyber-panel border border-cyber-border rounded-xl p-8 shadow-2xl relative overflow-hidden glow-blue">
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-blue animate-pulse" />

      {/* Header Layout */}
      <div className="flex items-center space-x-3 mb-6">
        <Terminal className="text-cyber-blue w-6 h-6 animate-pulse" />
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">
          Terminal Access Gateway
        </h2>
      </div>

      {/* Dynamic Error Readout */}
      {error && (
        <div className="mb-6 p-3 bg-red-950/40 border border-red-500/50 text-red-400 text-xs flex items-center space-x-2 rounded">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Investigator Identity Block */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-cyber-blue uppercase tracking-wider font-semibold mb-2">
            // [01] Input Investigator Identity
          </label>
          <input
            type="text"
            maxLength={20}
            placeholder="e.g., Detective Alpha"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-cyber-dark border border-cyber-border rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-blue transition-colors placeholder:text-slate-600"
          />
        </div>

        <hr className="border-cyber-border my-6" />

        {/* Option Alpha: Instantiate Room */}
        <div>
          <label className="block text-xs text-cyber-purple uppercase tracking-wider font-semibold mb-2">
            // Option A: Initialize Fresh Operation
          </label>
          <button
            onClick={handleCreateGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-950 to-blue-900 border border-cyber-blue/40 hover:border-cyber-blue text-cyber-blue hover:text-white font-bold py-3 px-4 rounded transition-all duration-300 flex items-center justify-center space-x-2 group text-sm"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>{loading ? "INITIALIZING STATE..." : "CREATE NEW CASE FILE"}</span>
          </button>
        </div>

        {/* Option Beta: Connection Bridge Input */}
        <form onSubmit={handleJoinGame} className="pt-2">
          <label className="block text-xs text-cyber-green uppercase tracking-wider font-semibold mb-2">
            // Option B: Sync into Extant Link Room
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              maxLength={4}
              placeholder="ROOM CODE"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-1/3 bg-cyber-dark border border-cyber-border rounded px-3 py-2 text-center text-sm tracking-widest text-cyber-green font-bold focus:outline-none focus:border-cyber-green uppercase placeholder:text-slate-700"
            />
            <button
              type="submit"
              className="w-2/3 bg-slate-900 hover:bg-cyber-green/10 border border-slate-700 hover:border-cyber-green text-slate-400 hover:text-cyber-green font-bold py-2 px-4 rounded transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>SYNC TERMINAL</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Lobby;