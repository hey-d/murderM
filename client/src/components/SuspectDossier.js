import React from "react";
import { Cpu, Building2, UserCircle, Radio, ShieldAlert } from "lucide-react";

function SuspectDossier({ activeSuspect, setActiveSuspect }) {
  
  // High-fidelity profile data matrix including custom programmatic portraits
  const profiles = [
    {
      key: "VANCE",
      name: "Chief Engineer Vance",
      role: "Head of Quantum Infrastructure",
      clearance: "LEVEL-5 CRITICAL",
      motive: "Fearing replacement by Alistair's advanced AI core automation layers.",
      color: "#ffb700",
      themeClass: "border-[#ffb700] bg-[#ffb700]/5 text-[#ffb700] glow-amber",
      icon: Cpu,
      // Custom inline portrait render representation
      avatarSvg: (
        <svg viewBox="0 0 100 100" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500">
          <rect width="100" height="100" fill="#121829"/>
          <circle cx="50" cy="40" r="22" fill="none" stroke="#ffb700" strokeWidth="2" strokeDasharray="4 2"/>
          <path d="M20 85C20 65 35 55 50 55C65 55 80 65 80 85" fill="none" stroke="#ffb700" strokeWidth="2"/>
          <path d="M40 38L45 43L60 28" fill="none" stroke="#ffb700" strokeWidth="1.5"/>
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#ffb700" strokeWidth="0.5" strokeOpacity="0.3"/>
        </svg>
      )
    },
    {
      key: "KAIRO",
      name: "Rival CEO Kairo",
      role: "OmniCorp Executive Coordinator",
      clearance: "EXTERNAL DIPLOMATIC",
      motive: "Desperately needs Alistair's core data maps to save his failing tech conglomerate.",
      color: "#d300ff",
      themeClass: "border-[#d300ff] bg-[#d300ff]/5 text-[#d300ff] glow-purple",
      icon: Building2,
      avatarSvg: (
        <svg viewBox="0 0 100 100" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500">
          <rect width="100" height="100" fill="#121829"/>
          <circle cx="50" cy="40" r="20" fill="none" stroke="#d300ff" strokeWidth="2"/>
          <path d="M25 85C25 68 36 60 50 60C64 60 75 68 75 85" fill="none" stroke="#d300ff" strokeWidth="2" strokeDasharray="3 1"/>
          <line x1="50" y1="20" x2="50" y2="10" stroke="#d300ff" strokeWidth="1.5"/>
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#d300ff" strokeWidth="0.5" strokeOpacity="0.3"/>
        </svg>
      )
    },
    {
      key: "UNIT7",
      name: "Android Butler Unit-7",
      role: "Synthetic Compound Maintenance",
      clearance: "RESTRICTED DOMESTIC",
      motive: "A secret secondary command override program executed during the breach event.",
      color: "#00ff66",
      themeClass: "border-[#00ff66] bg-[#00ff66]/5 text-[#00ff66] glow-green",
      icon: UserCircle,
      avatarSvg: (
        <svg viewBox="0 0 100 100" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500">
          <rect width="100" height="100" fill="#121829"/>
          <rect x="38" y="25" width="24" height="26" rx="4" fill="none" stroke="#00ff66" strokeWidth="2"/>
          <path d="M22 85C22 70 33 62 50 62C67 62 78 70 78 85" fill="none" stroke="#00ff66" strokeWidth="2"/>
          <circle cx="45" cy="35" r="2" fill="#00ff66"/>
          <circle cx="55" cy="35" r="2" fill="#00ff66"/>
          <line x1="42" y1="44" x2="58" y2="44" stroke="#00ff66" strokeWidth="1.5"/>
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#00ff66" strokeWidth="0.5" strokeOpacity="0.3"/>
        </svg>
      )
    }
  ];

  return (
    <div className="w-full bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-xl relative">
      {/* Structural Interactive Section Header */}
      <div className="flex items-center space-x-2 text-slate-400 border-b border-cyber-border pb-3 mb-4">
        <Radio className="w-4 h-4 text-cyber-blue animate-pulse" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white">
          Active Suspect Dossiers Grid
        </h3>
      </div>

      {/* Primary Grid Workspace */}
      <div className="grid grid-cols-1 gap-4">
        {profiles.map((suspect) => {
          const isSelected = activeSuspect === suspect.key;
          const CustomIcon = suspect.icon;

          return (
            <div
              key={suspect.key}
              onClick={() => setActiveSuspect(suspect.key)}
              className={`w-full group text-left border p-4 rounded-xl transition-all duration-300 cursor-pointer grid grid-cols-12 gap-4 relative overflow-hidden ${
                isSelected
                  ? `${suspect.themeClass} bg-cyber-dark/80`
                  : "border-cyber-border bg-cyber-dark/30 hover:border-slate-600 text-slate-400"
              }`}
            >
              {/* SEGMENT 1: High-Tech Profile ID Scan Window (3/12 Columns wide) */}
              <div className="col-span-12 sm:col-span-3 lg:col-span-2 border border-cyber-border rounded-lg overflow-hidden relative max-h-[110px] bg-black shadow-inner">
                {suspect.avatarSvg}
                {/* HUD Camera Crosshairs Overlay */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-slate-500" />
                <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-slate-500" />
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-slate-500" />
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-slate-500" />
                {isSelected && (
                  <div 
                    className="absolute inset-0 border-2 pointer-events-none opacity-40 animate-pulse"
                    style={{ borderColor: suspect.color }}
                  />
                )}
              </div>

              {/* SEGMENT 2: Core Records Dossier Information Feed (9/12 Columns wide) */}
              <div className="col-span-12 sm:col-span-9 lg:col-span-10 flex flex-col justify-between space-y-2">
                
                {/* Header Information Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyber-border/30 pb-1 gap-1">
                  <div className="flex items-center space-x-2">
                    <CustomIcon className="w-4 h-4 flex-shrink-0" />
                    <h4 className="text-sm font-black text-white tracking-wide uppercase font-mono">
                      {suspect.name}
                    </h4>
                  </div>
                  <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase border w-max ${
                    isSelected 
                      ? "bg-transparent border-current animate-pulse" 
                      : "bg-cyber-dark text-slate-500 border-transparent"
                  }`}>
                    {isSelected ? "🔗 CHANNELS CONNECTED" : "📡 LINK STANDBY"}
                  </span>
                </div>

                {/* Dossier Body Spec Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px] font-mono leading-relaxed">
                  <div>
                    <span className="text-slate-500 block sm:inline font-bold">// ASSIGNED ROLE: </span>
                    <span className="text-slate-200">{suspect.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block sm:inline font-bold">// CLEARANCE SIGNATURE: </span>
                    <span className="text-slate-300 font-bold">{suspect.clearance}</span>
                  </div>
                  <div className="md:col-span-2 mt-1 border-t border-cyber-border/20 pt-1">
                    <span className="text-slate-500 font-bold flex items-center space-x-1 uppercase text-[10px] tracking-wider mb-0.5">
                      <ShieldAlert className="w-3 h-3 text-red-500/60" />
                      <span>Probable Motive Matrix:</span>
                    </span>
                    <p className="text-slate-400 italic pl-4 border-l border-cyber-border/50">
                      {suspect.motive}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SuspectDossier;