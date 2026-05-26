import React from "react";
import { Skull, AlertOctagon, Terminal, FileText } from "lucide-react";

function IntroCard({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-cyber-panel border-2 border-cyber-blue rounded-xl p-6 md:p-8 relative overflow-hidden shadow-2xl shadow-cyan-500/10 max-h-[90vh] flex flex-col justify-between">
        
        {/* Animated Scanning Line Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-blue/5 to-transparent pointer-events-none animate-[pulse_2s_infinite]" />
        
        {/* Upper Meta Readout Block */}
        <div className="overflow-y-auto space-y-6 pr-2">
          
          {/* Header Identity Bar */}
          <div className="flex items-center justify-between border-b border-cyber-border pb-4">
            <div className="flex items-center space-x-3 text-cyber-blue">
              <Skull className="w-6 h-6 text-red-500 animate-pulse" />
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white font-mono">
                  CLASSIFIED CASE FILE // RESTRICTED ACCESS
                </h2>
                <p className="text-[10px] text-slate-500 tracking-wider">
                  INCIDENT NO: #2026-NQT-MURDER
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 bg-red-950/40 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>HOMICIDE PROTOCOL ACTIVATED</span>
            </div>
          </div>

          {/* Crime File Details Section Layout */}
          <div className="space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-cyber-dark/60 p-3 rounded border border-cyber-border/40">
              <div><span className="text-cyber-blue font-bold">// VICTIM:</span> Dr. Alistair Sterling</div>
              <div><span className="text-cyber-blue font-bold">// LOCATION:</span> Sterling Quantum Manor</div>
              <div><span className="text-cyber-blue font-bold">// TIME:</span> 22:42:18 UTC</div>
              <div><span className="text-cyber-blue font-bold">// STATUS:</span> Unresolved Corporate Sabotage</div>
            </div>

            {/* Narrative Context Injection */}
            <div className="space-y-3">
              <h3 className="text-white font-bold flex items-center space-x-1 uppercase text-[11px] tracking-wider border-b border-cyber-border/30 pb-1">
                <FileText className="w-3.5 h-3.5 text-cyber-purple" />
                <span>Executive Incident Summary</span>
              </h3>
              <p>
                Dr. Alistair Sterling, Chief Architect of the world's first stable decentralized Quantum AI Core, has been found dead inside his high-security penthouse lab at Sterling Manor. The core's local access drive has been completely erased.
              </p>
              <p>
                Security lockdown mechanisms immediately isolated the property. Only three individuals were present on the network compound grids at the time of the fatal sub-routine breach. Each suspect has high-clearance clearance nodes, and one of them is the calculated perpetrator.
              </p>
            </div>

            {/* Tactical Briefing Instructions */}
            <div className="p-3 bg-cyber-blue/5 border border-cyber-blue/20 rounded text-slate-300 text-[11px]">
              <div className="font-bold text-cyber-blue uppercase mb-1 flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>INTELLIGENCE INSTRUCTIONS:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>You have exactly <span className="text-white font-bold">15 collective interrogation connection keys</span> before firewall blocks sever your terminal access link entirely.</li>
                <li>Coordinate securely with your investigator team in private player comms.</li>
                <li>When the true killer is exposed, execute the collective democratic voting ballot to lock down the offender. A single misstep allows the asset to erase themselves.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Action Button Gateway Bottom Footer */}
        <div className="border-t border-cyber-border pt-4 mt-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-slate-900 font-black py-3 rounded text-xs tracking-widest uppercase transition-all duration-300 shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5"
          >
            INITIALIZE SYSTEM LINK & ACCESS ENCRYPTED INTERROGATION CORES
          </button>
        </div>

      </div>
    </div>
  );
}

export default IntroCard;