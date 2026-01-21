'use client'
import { X, Code2, User, Github, Trophy } from 'lucide-react';

export default function ProfileModal({ profile, isOpen, onClose }: any) {
  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
        
        {/* Header Background */}
        <div className="h-24 bg-gradient-to-r from-blue-900/50 to-purple-900/50 relative">
             <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 rounded-full p-1"><X className="h-5 w-5"/></button>
        </div>

        {/* Avatar & Info */}
        <div className="px-6 pb-6 -mt-10 relative">
            <div className="flex justify-between items-end mb-3">
                <div className="h-20 w-20 rounded-full bg-black border-4 border-gray-900 flex items-center justify-center overflow-hidden">
                     {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover"/>
                     ) : (
                        <div className="text-2xl font-bold text-gray-500">{profile.username?.[0]?.toUpperCase()}</div>
                     )}
                </div>
                
                {/* Global XP Badge */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-4">
                    <Trophy className="h-3 w-3" /> {profile.global_xp || 0} XP
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {profile.full_name || profile.username}
            </h2>
            <div className="flex items-center gap-2 mb-4">
                <p className="text-blue-400 text-sm font-mono">@{profile.username}</p>
                {profile.github_handle && (
                    <a 
                        href={`https://github.com/${profile.github_handle}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-gray-500 hover:text-white transition"
                    >
                        <Github className="h-4 w-4" />
                    </a>
                )}
            </div>

            {/* Bio */}
            <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <User className="h-3 w-3" /> Bio
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                    {profile.bio || "This agent has not added a bio yet."}
                </p>
            </div>

            {/* Tech Stack (Using your existing column) */}
            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <Code2 className="h-3 w-3" /> Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                    {profile.tech_stack && profile.tech_stack.length > 0 ? (
                        profile.tech_stack.map((skill: string) => (
                            <span key={skill} className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full text-xs font-bold">
                                {skill}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 text-xs italic">No tech stack listed.</span>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}