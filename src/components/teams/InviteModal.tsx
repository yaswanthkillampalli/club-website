'use client'
import { useState, useEffect } from 'react';
import { searchUsers, inviteUserToTeam, getPendingInvites } from '@/lib/api/teams';
import { Search, UserPlus, X, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteModal({ team, isOpen, onClose, existingMemberIds = [] }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [pendingUserIds, setPendingUserIds] = useState<string[]>([]); // Track sent invites
  const [loading, setLoading] = useState(false);

  // 1. Fetch pending invites when modal opens
  useEffect(() => {
    if (isOpen && team?.id) {
      setPendingUserIds([]);
      getPendingInvites(team.id).then((ids) => {
        console.log("Pending IDs found:", ids);
        setPendingUserIds(ids);
      });
      setQuery('');
      setResults([]);
    }
  }, [isOpen, team.id]);

  if (!isOpen) return null;

  const handleSearch = async (e: any) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length > 2) {
      const users = await searchUsers(val);
      
      // 2. FILTER LOGIC: Remove users who are already in the team
      const filtered = users.filter((u: any) => !existingMemberIds.includes(u.id));
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const sendInvite = async (user: any) => {
    if (loading) return; 
    setLoading(true);

    try {
      await inviteUserToTeam(team.id, team.name, user.id);
      
      toast.success(`Invite sent to ${user.username}`);
      
      // 3. Update local state so button changes immediately to "Pending"
      setPendingUserIds((prev) => [...prev, user.id]);
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
        
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UserPlus className="text-blue-500" /> Invite Agent
        </h2>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by username..." 
            className="w-full bg-black border border-white/20 rounded-lg py-2 pl-10 text-white focus:border-blue-500 outline-none"
            value={query}
            onChange={handleSearch}
            autoFocus
          />
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {results.map(u => {
              // Check if this user is already invited
              const isPending = pendingUserIds.includes(u.id);

              return (
                <div key={u.id} className="flex justify-between items-center bg-white/5 p-3 rounded hover:bg-white/10 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                      {u.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="font-medium text-white">{u.username}</span>
                  </div>
                  
                  {isPending ? (
                    // PENDING STATE BUTTON
                    <button 
                      disabled
                      className="text-xs bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1.5 rounded font-bold flex items-center gap-1 cursor-not-allowed opacity-80"
                    >
                      <Clock className="h-3 w-3" /> SENT
                    </button>
                  ) : (
                    // INVITE STATE BUTTON
                    <button 
                      disabled={loading}
                      onClick={() => sendInvite(u)}
                      className="text-xs bg-blue-600 px-3 py-1.5 rounded font-bold hover:bg-blue-500 text-white transition flex items-center gap-1"
                    >
                      INVITE
                    </button>
                  )}
                </div>
              );
            })}
            
            {query.length > 2 && results.length === 0 && (
              <p className="text-gray-500 text-center text-sm py-4">
                No matching agents found (or they are already in the squad).
              </p>
            )}
        </div>
      </div>
    </div>
  );
}