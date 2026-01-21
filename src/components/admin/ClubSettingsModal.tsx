'use client'
import { useState, useEffect } from 'react';
import { getClubLeaders, searchUsersAdmin, assignClubRole, removeClubLeader } from '@/lib/api/admin';
import { X, Shield, Search, UserPlus, Trash2, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function ClubSettingsModal({ club, isOpen, onClose }: any) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load current admins when modal opens
  useEffect(() => {
    if (isOpen && club) {
        loadLeaders();
        setQuery('');
        setResults([]);
    }
  }, [isOpen, club]);

  const loadLeaders = async () => {
    const data = await getClubLeaders(club.id);
    setLeaders(data);
  };

  const handleSearch = async (e: any) => {
    setQuery(e.target.value);
    if (e.target.value.length > 2) {
        const users = await searchUsersAdmin(e.target.value);
        setResults(users);
    } else {
        setResults([]);
    }
  };

  const handleAssign = async (user: any, role: 'admin' | 'moderator') => {
    setLoading(true);
    try {
        await assignClubRole(club.id, user.id, role);
        toast.success(`Assigned ${role} role to ${user.username}`);
        loadLeaders(); // Refresh list
        setQuery('');
        setResults([]);
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleRemove = async (membershipId: string) => {
      if(confirm("Revoke leadership access?")) {
          await removeClubLeader(membershipId);
          loadLeaders();
      }
  };

  if (!isOpen || !club) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-lg p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
        
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="text-blue-500" /> Manage: {club.name}
        </h2>

        {/* 1. CURRENT LEADERSHIP LIST */}
        <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Current Leadership</h3>
            <div className="space-y-2">
                {leaders.length === 0 && <p className="text-sm text-red-400 italic">No admins assigned (Headless Club)</p>}
                
                {leaders.map(l => (
                    <div key={l.id} className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/10">
                        <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-full bg-blue-900 flex items-center justify-center font-bold text-xs">
                                {l.profiles.username[0].toUpperCase()}
                             </div>
                             <div>
                                <div className="font-bold text-sm text-white flex items-center gap-2">
                                    {l.profiles.username}
                                    {l.role === 'admin' && <Crown className="h-3 w-3 text-yellow-500" />}
                                </div>
                                <div className="text-[10px] uppercase text-gray-500">{l.role}</div>
                             </div>
                        </div>
                        <button onClick={() => handleRemove(l.id)} className="text-gray-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                ))}
            </div>
        </div>

        {/* 2. ADD NEW LEADER */}
        <div className="border-t border-white/10 pt-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Appoint New Leader</h3>
            
            <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input 
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search username..."
                    className="w-full bg-black border border-white/20 rounded-lg py-2 pl-10 text-white focus:border-blue-500 outline-none"
                />
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {results.map(u => (
                    <div key={u.id} className="flex justify-between items-center bg-black p-2 rounded border border-white/10">
                        <span className="font-bold text-sm text-gray-300 pl-2">{u.username}</span>
                        <div className="flex gap-2">
                            <button 
                                disabled={loading}
                                onClick={() => handleAssign(u, 'moderator')}
                                className="text-[10px] font-bold bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-white"
                            >
                                MOD
                            </button>
                            <button 
                                disabled={loading}
                                onClick={() => handleAssign(u, 'admin')}
                                className="text-[10px] font-bold bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-white flex items-center gap-1"
                            >
                                ADMIN
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}