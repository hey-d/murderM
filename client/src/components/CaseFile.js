import React from "react";
import { FolderKanban, ShieldAlert, Users, Radio, Hourglass } from "lucide-react";

function CaseFile({ roomCode, questionsRemaining, playerName }) {
  // Compute percentage for the tactical visual tracking bar (Max default pool size is 15)
  const remainingPercentage = (questionsRemaining / 15) * 100;
  
  // Decide conditional color styling states based on remaining token danger levels
  const isDangerLow = questionsRemaining <= 4;

  return (
    <div className="w-full bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-xl relative overflow-hidden glow-blue h-full flex flex-col justify-between">
      {/* Structural Interior Header */}
      <div>
        <div className="flex items-center space-x-2 text-cyber-blue border-b border-cyber-border pb-3 mb-4">
          <FolderKanban className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            Active Dossier Logs
          </h3>
        </div>

        {/* Tactical Room Identification Parameter Rows */}
        <div className="space-y-4">
          <div className="bg-cyber-dark/60 border border-cyber-border/40 p-3 rounded flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Radio className="w-3.5 h-3.5 text-cyber-blue animate-pulse" />
              <span>COMMUNICATION LINK:</span>
            </div>
            <span className="text-sm font-black text-cyber-blue tracking-widest">
              #{roomCode}
            </span>
          </div>

          <div className="bg-cyber-dark/60 border border-cyber-border/40 p-3 rounded flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>LEAD DETECTIVE:</span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[120px]">
              {playerName}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Token Meter Monitoring Panel */}
      <div className="mt-8 border-t border-cyber-border/30 pt-4">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Hourglass className={`w-3.5 h-3.5 ${isDangerLow ? "text-red-500 animate-spin" : "text-cyber-blue"}`} />
            <span>Terminal Access Time</span>
          </div>
          <span className={`text-xl font-black ${isDangerLow ? "text-red-500 animate-pulse" : "text-cyber-green"}`}>
            {questionsRemaining}/15
          </span>
        </div>

        {/* Outer Metrical Bar Carrier */}
        <div className="w-full h-2.5 bg-cyber-dark border border-cyber-border rounded-full overflow-hidden p-0.5">
          {/* Inner Meter Element */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDangerLow 
                ? "bg-gradient-to-r from-red-600 to-rose-500 animate-pulse" 
                : "bg-gradient-to-r from-cyber-blue to-cyan-400"
            }`}
            style={{ width: `${Math.max(0, Math.min(100, remainingPercentage))}%` }}
          />
        </div>

        {/* Conditional Low Inquiries Alarm Broadcast */}
        {isDangerLow && (
          <div className="mt-3 flex items-center space-x-2 text-[10px] text-red-400 border border-red-950/50 bg-red-950/20 p-2 rounded animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
            <span>WARNING: INTEL DECRYPTION POOL CRITICALLY DEPLETED. PREPARE FINAL ACCUSATION immediately.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CaseFile;