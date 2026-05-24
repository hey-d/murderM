import React from "react";
import { User, Cpu, Building2, Radio } from "lucide-react";

function Lineup({ activeSuspect, setActiveSuspect }) {
  // Static suspect identity array mapping our core backend key matrices
  const suspectProfiles = [
    {
      key: "VANCE",
      name: "Chief Engineer Vance",
      title: "Head of Infrastructure",
      icon: Cpu,
      color: "cyber-amber",
      glowClass: "glow-amber",
      activeBorder: "border-[#ffb700]",
      bgTheme: "hover:bg-[#ffb700]/5"
    },
    {
      key: "KAIRO",
      name: "Rival CEO Kairo",
      title: "OmniCorp Executive",
      icon: Building2,
      color: "cyber-purple",
      glowClass: "glow-purple",
      activeBorder: "border-[#d300ff]",
      bgTheme: "hover:bg-[#d300ff]/5"
    },
    {
      key: "UNIT7",
      name: "Android Butler Unit-7",
      title: "Synthetic Service Unit",
      icon: User,
      color: "cyber-green",
      glowClass: "glow-green",
      activeBorder: "border-[#00ff66]",
      bgTheme: "hover:bg-[#00ff66]/5"
    }
  ];

  return (
    <div className="w-full bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-xl">
      <div className="flex items-center space-x-2 text-slate-400 border-b border-cyber-border pb-3 mb-4">
        <Radio className="w-4 h-4 text-cyber-blue animate-pulse" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white">
          Suspect Comm-Link Feeds
        </h3>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suspectProfiles.map((suspect) => {
          const IconComponent = suspect.icon;
          const isSelected = activeSuspect === suspect.key;

          return (
            <button
              key={suspect.key}
              onClick={() => setActiveSuspect(suspect.key)}
              className={`w-full text-left bg-cyber-dark/40 border p-4 rounded-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${suspect.bgTheme} ${
                isSelected 
                  ? `${suspect.activeBorder} ${suspect.glowClass} bg-cyber-dark/90` 
                  : "border-cyber-border/60 hover:border-slate-600"
              }`}
            >
              {/* Dynamic Status Beacon Indicator */}
              <div className="flex justify-between items-start w-full mb-3">
                <div className="p-2 bg-cyber-dark border border-cyber-border rounded">
                  <IconComponent className={`w-5 h-5 ${isSelected ? `text-${suspect.color}` : "text-slate-500"}`} />
                </div>
                <span className={`text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase border ${
                  isSelected 
                    ? `bg-cyber-dark text-${suspect.color} border-${suspect.color}/30 animate-pulse` 
                    : "bg-transparent text-slate-600 border-transparent"
                }`}>
                  {isSelected ? "CONNECTED" : "STANDBY"}
                </span>
              </div>

              {/* Text Meta Blocks */}
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide truncate">
                  {suspect.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {suspect.title}
                </p>
              </div>

              {/* Technical Indicator Line */}
              <div className={`w-full h-0.5 mt-4 rounded-full ${isSelected ? `bg-${suspect.color}` : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Lineup;