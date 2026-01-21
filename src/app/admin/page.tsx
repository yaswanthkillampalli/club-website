'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkIsSuperAdmin, createClub, deleteClub } from '@/lib/api/admin';
import { getAllClubs } from '@/lib/api/clubs'; // Reuse this from previous step
import { ShieldAlert, Plus, Trash2, LayoutGrid, Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import ClubSettingsModal from '@/components/admin/ClubSettingsModal';

export default function SuperAdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Modal State
  const [selectedClub, setSelectedClub] = useState<any>(null);
  // Data State
  const [clubs, setClubs] = useState<any[]>([]);
  
  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Technical');
  const [banner, setBanner] = useState('');
  const [creating, setCreating] = useState(false);

  // 1. SECURITY CHECK & INITIAL LOAD
  useEffect(() => {
    async function init() {
      const isSuper = await checkIsSuperAdmin();
      if (!isSuper) {
        toast.error("ACCESS DENIED: Super Admin privileges required.");
        router.push('/'); // Kick them out
        return;
      }
      
      setIsAdmin(true);
      loadClubs();
      setChecking(false);
    }
    init();
  }, [router]);

  const loadClubs = async () => {
    const data = await getAllClubs();
    setClubs(data);
  };

  // 2. CREATE CLUB HANDLER
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createClub({
        name,
        description: desc,
        category,
        banner_url: banner || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80' // Default Tech Image
      });
      
      toast.success(`${name} has been established.`);
      // Reset Form
      setName('');
      setDesc('');
      setBanner('');
      loadClubs(); // Refresh list
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  // 3. DELETE HANDLER
  const handleDelete = async (id: string, clubName: string) => {
    if(confirm(`Are you sure you want to delete ${clubName}? This will wipe all members and data.`)) {
        try {
            await deleteClub(id);
            toast.success("Club deleted.");
            loadClubs();
        } catch(err: any) {
            toast.error(err.message);
        }
    }
  };

  if (checking) return <div className="h-screen bg-black flex items-center justify-center text-blue-500 font-mono">Verifying Biometrics...</div>;
  if (!isAdmin) return null; // Should have redirected already

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="border-b border-red-500/30 pb-6 mb-8 flex items-center gap-4">
            <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 border border-red-500/20">
                <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">SUPER_ADMIN_CONSOLE</h1>
                <p className="text-red-400 font-mono text-sm">Clearance Level: OMEGA</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: CREATE FORM */}
            <div className="lg:col-span-1">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-24">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-blue-500" /> Establish Club
                    </h2>
                    
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Club Name</label>
                            <input 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded p-2 text-white mt-1 focus:border-blue-500 outline-none"
                                placeholder="e.g. AI Nexus"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                            <select 
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded p-2 text-white mt-1 focus:border-blue-500 outline-none"
                            >
                                <option value="Technical">Technical</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Sports">Sports</option>
                                <option value="Gaming">Gaming</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Banner Image URL</label>
                            <input 
                                value={banner}
                                onChange={e => setBanner(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded p-2 text-white mt-1 focus:border-blue-500 outline-none text-xs"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea 
                                required
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded p-2 text-white mt-1 h-24 resize-none focus:border-blue-500 outline-none"
                                placeholder="Mission statement..."
                            />
                        </div>

                        <button 
                            disabled={creating}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                        >
                            {creating ? <Loader2 className="animate-spin" /> : 'INITIALIZE CLUB'}
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT: CLUB LIST */}
            <div className="lg:col-span-2">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-green-500" /> Active Units ({clubs.length})
                </h2>

                <div className="space-y-4">
                    {clubs.length === 0 && <div className="text-gray-500 italic">No clubs initialized.</div>}
                    
                    {clubs.map((club) => (
                        <div key={club.id} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition group">
                            <div className="flex items-center gap-4">
                                {/* Thumbnail */}
                                <div className="h-12 w-12 rounded bg-gray-800 overflow-hidden border border-white/10">
                                    {club.banner_url ? (
                                        <img src={club.banner_url} className="h-full w-full object-cover" alt="" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-500">IMG</div>
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-white">{club.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-500/20">
                                            {club.category}
                                        </span>
                                        <span className="text-xs text-gray-500">ID: {club.id.slice(0,8)}...</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedClub(club)}
                                className="p-2 hover:bg-blue-500/20 rounded text-gray-500 hover:text-blue-500 transition"
                                title="Manage Leadership"
                            >
                                <Settings className="h-5 w-5" />
                            </button>

                            <button 
                                onClick={() => handleDelete(club.id, club.name)}
                                className="p-2 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-500 transition"
                                title="Delete Club"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
      <ClubSettingsModal 
            club={selectedClub} 
            isOpen={!!selectedClub} 
            onClose={() => setSelectedClub(null)} 
        />
    </div>
  );
}