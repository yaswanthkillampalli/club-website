'use client'
import { Shield } from 'lucide-react';

export default function TeamCard({ team, onApply }: { team: any, onApply: (t: any) => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 hover:bg-white/10 transition group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-black rounded-lg border border-white/10 group-hover:border-blue-500/30">
                <Shield className="h-6 w-6 text-gray-400 group-hover:text-blue-400" />
            </div>
            <button 
              onClick={() => onApply(team)}
              className="text-xs font-bold bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
            >
              APPLY
            </button>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
            {team.description || "No description provided."}
        </p>
        
        <div className="text-xs text-gray-500 font-mono">
            CAPTAIN ID: {team.captain_id.slice(0, 8)}...
        </div>
    </div>
  );
}