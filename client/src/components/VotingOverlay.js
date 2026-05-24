import React, { useState } from "react";
import { Gavel, Users, ShieldAlert, CheckCircle2 } from "lucide-react";

function VotingOverlay({ players, currentSocketId, socket, roomCode }) {
  const [selectedSuspect, setSelectedSuspect] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  // 1. Calculate live election tracking stats
  const totalPlayers = players.length;
  const votedCount = players.filter((p) => p.vote !== null).length;
  const votingProgressPercentage = (votedCount / totalPlayers) * 100;

  // Check if this specific player instance has already logged their ballot
  const checkMyVoteStatus = players.find((p) => p.socketId === currentSocketId);
  const amIVotedInDB = checkMyVoteStatus && checkMyVoteStatus.vote !== null;

  // 2. Submit ballot payload to the backend configuration gateway
  const handleVoteSubmission = (e) => {
    e.preventDefault();
    if (!selectedSuspect || hasVoted || amIVotedInDB || !socket) return;

    setHasVoted(true);
    socket.emit("cast_vote", {
      accusedSuspect: selectedSuspect
    });
  };

  const suspects = [
    { id: "VANCE", name: "Chief Engineer Vance", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
    { id: "KAIRO", name: "Rival CEO Kairo", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
    { id: "UNIT7", name: "Android Butler Unit-7", color: "text-green-400 border-green-500/20 bg-green-500/5" }
  ];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-lg flex items-center justify-center z-50 p-4 font-mono animate-fadeIn">
      <div className="w-full max-w-xl bg-cyber-panel border-2 border-red-500/40 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-red-900/10">
        
        {/* Top Danger Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-pulse" />

        {/* Header Block */}
        <div className="flex items-center space-x-3 text-red-400 mb-6 border-b border-cyber-border pb-4">
          <Gavel className="w-6 h-6 animate-pulse" />
          <div>
            <h2 className="text-lg font-black tracking-widest uppercase text-white">DEMOCRATIC ACCUSATION PROTOCOL</h2>
            <p className="text-[10px] text-slate-500 tracking-wider">ROOM MATRIX FREQUENCY: #{roomCode}</p>
          </div>
        </div>

        {/* Global Voting Progress Ticker Meter */}
        <div className="bg-cyber-dark/80 border border-cyber-border/80 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-slate-400 font-bold flex items-center space-x-1.5 uppercase">
              <Users className="w-3.5 h-3.5 text-cyber-blue" />
              <span>Ballot Sync Status</span>
            </span>
            <span className="text-cyber-green font-black tracking-widest">
              {votedCount} / {totalPlayers} DETECTIVES SIGNED
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 border border-cyber-border rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-cyber-blue rounded-full transition-all duration-500"
              style={{ width: `${votingProgressPercentage}%` }}
            />
          </div>
        </div>

        {/* Main Ballot Form */}
        {hasVoted || amIVotedInDB ? (
          /* Ballot Confirmed Waiting State Display Screen */
          <div className="text-center py-8 space-y-3 bg-cyber-dark/30 border border-dashed border-cyber-border rounded-xl animate-pulse">
            <CheckCircle2 className="w-10 h-10 text-cyber-green mx-auto" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ballot Securely Encrypted</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto px-4 leading-relaxed">
              Your signature has been committed to the server nodes. Awaiting remaining active investigator confirmations before running final outcome routines...
            </p>
          </div>
        ) : (
          /* Interactive Voting Form Option Arrays */
          <form onSubmit={handleVoteSubmission} className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                // Select Warrant Target:
              </span>
              {suspects.map((suspect) => (
                <label
                  key={suspect.id}
                  className={`flex items-center justify-between p-3.5 border rounded-lg cursor-pointer transition-all ${
                    selectedSuspect === suspect.id
                      ? "border-red-500 bg-red-950/20 text-white"
                      : "border-cyber-border bg-cyber-dark/40 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="ballotSuspect"
                      value={suspect.id}
                      checked={selectedSuspect === suspect.id}
                      onChange={(e) => setSelectedSuspect(e.target.value)}
                      className="accent-red-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">{suspect.name}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Warn Block Warning Note */}
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded text-[10px] text-red-400 flex items-center space-x-2 leading-relaxed">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-pulse" />
              <span>CAUTION: Majority consensus rules apply. If the team ties or selects an innocent suspect, the true killer escapes. Ensure total alignment.</span>
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={!selectedSuspect}
              className="w-full bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white disabled:opacity-20 disabled:pointer-events-none font-black py-3 rounded text-xs tracking-widest uppercase transition-all shadow-lg shadow-red-700/20 flex items-center justify-center space-x-2"
            >
              <Gavel className="w-4 h-4" />
              <span>COMMIT ACCUSATION WARRANT SIGNATURE</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default VotingOverlay;