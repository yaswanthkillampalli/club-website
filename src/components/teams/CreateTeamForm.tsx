'use client'
import { useState } from 'react';
import { createTeam } from '@/lib/api/teams';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
export default function CreateTeamForm({ user, onSuccess }: { user: any, onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTeam(name, desc, user.id);
      toast.success("Squad established successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error("Failed to create team: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Squad</h2>
        <p className="text-gray-400 mb-8">You aren't in a team yet. Start one and invite others.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Team Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                  placeholder="e.g. Cyber Punks"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition h-24 resize-none"
                  placeholder="What is your team building?"
                />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'CREATE TEAM'}
            </button>
        </form>
    </div>
  );
}