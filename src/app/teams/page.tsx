'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  getMyTeam, 
  getAllTeams, 
  requestToJoinTeam, 
  getMyNotifications, 
  acceptApplication, 
  acceptInvite, 
  markNotificationRead,
  removeMember,
  rejectInvite
} from '@/lib/api/teams';
import { Bell, Shield, Users, Inbox, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

// Sub-Components
import TeamCard from '@/components/teams/TeamCard';
import CreateTeamForm from '@/components/teams/CreateTeamForm';
import TeamDashboard from '@/components/teams/TeamDashboard';

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState<'find' | 'my-team' | 'inbox'>('my-team');
  const [user, setUser] = useState<any>(null);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: Filter States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const supabase = createClient();

  // 1. INITIAL LOAD
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const team = await getMyTeam(user.id);
        setMyTeam(team);
        const notifs = await getMyNotifications(user.id);
        setNotifications(notifs || []);
      }
      setLoading(false);
    }
    init();
  }, []);

  // 2. LOAD MARKETPLACE
  useEffect(() => {
    if (activeTab === 'find') {
      getAllTeams().then((data) => {
        setAllTeams(data?.filter((t: any) => t.id !== myTeam?.id) || []);
      });
    }
  }, [activeTab, myTeam]);

  // --- FILTER LOGIC ---
  
  // 1. Get all unique tags from all teams
  const allTags = Array.from(new Set(allTeams.flatMap(t => t.tags || []))).sort();

  // 2. Filter the teams based on Search Text AND Selected Tag
  const filteredTeams = allTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeFilter === 'All' || team.tags?.includes(activeFilter);
    return matchesSearch && matchesTag;
  });


  // --- ACTIONS ---
  const handleApply = async (team: any) => {
    if (!user) return toast.error("Login required");
    const toastId = toast.loading("Sending request...");
    try {
      await requestToJoinTeam(team.id, team.name, team.captain_id, user.user_metadata.full_name || 'User', user.id);
      toast.success(`Request sent to ${team.name}`);
      toast.dismiss(toastId);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message);
    }
  };

  const handleLeave = async () => {
     // (Logic handled inside dashboard now via modals, but keeping callback for safety)
     window.location.reload();
  };

  const handleAcceptNotif = async (n: any) => {
    const toastId = toast.loading("Processing...");
    try {
      if (n.type === 'invite') {
         await acceptInvite(n.id, n.data.team_id, user.id);
         toast.success("Welcome to the team!");
      } else if (n.type === 'application') {
         await acceptApplication(n.id, n.data.team_id, n.data.candidate_id);
         toast.success("New member added!");
      }
      toast.dismiss(toastId);
      window.location.reload();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message);
    }
  };

  const handleRejectNotif = async (n: any) => {
     try {
        if(n.type === 'invite') {
            await rejectInvite(n.id, n.data.team_id, user.id);
            toast.info("Invite declined");
        } else {
            await markNotificationRead(n.id);
        }
        setNotifications(prev => prev.filter(item => item.id !== n.id));
     } catch(err) { console.error(err); }
  };


  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading HQ...</div>;

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white pb-20">
      <div className="mx-auto max-w-5xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-500 tracking-tighter flex items-center gap-2">
              <Shield className="h-8 w-8" /> SQUAD_HQ
            </h1>
            <p className="text-gray-400">Manage your unit or find a squad.</p>
          </div>
          
          <button 
            onClick={() => setActiveTab('inbox')} 
            className={`relative p-3 rounded-full transition ${activeTab === 'inbox' ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
          >
            <Bell className="h-6 w-6" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold border-2 border-black">
                {notifications.length}
              </span>
            )}
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-6 border-b border-white/10 mb-8 overflow-x-auto">
          {[
            { id: 'my-team', label: 'MY TEAM', icon: Shield },
            { id: 'find', label: 'FIND SQUAD', icon: Users },
            { id: 'inbox', label: 'INBOX', icon: Inbox },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`pb-3 flex items-center gap-2 font-bold transition border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* --- VIEWS --- */}

        {/* 1. MY TEAM VIEW */}
        {activeTab === 'my-team' && (
            myTeam 
              ? <TeamDashboard team={myTeam} user={user} onLeave={handleLeave} /> 
              : <CreateTeamForm user={user} onSuccess={() => window.location.reload()} />
        )}

        {/* 2. FIND TEAM VIEW (UPDATED WITH FILTERS) */}
        {activeTab === 'find' && (
            <div className="space-y-6">
                
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search by team name..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 text-white focus:border-blue-500 outline-none transition"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tech Tags Row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    <Filter className="h-4 w-4 text-gray-500 mr-1 shrink-0" />
                    <button 
                        onClick={() => setActiveFilter('All')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap ${
                            activeFilter === 'All' 
                            ? 'bg-blue-600 text-white border-blue-500' 
                            : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                        }`}
                    >
                        All
                    </button>
                    {allTags.map(tag => (
                        <button 
                            key={tag as string}
                            onClick={() => setActiveFilter(tag as string)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition whitespace-nowrap ${
                                activeFilter === tag 
                                ? 'bg-blue-600 text-white border-blue-500' 
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-blue-500/50'
                            }`}
                        >
                            {tag as string}
                        </button>
                    ))}
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredTeams.map((t: any) => (
                      <TeamCard key={t.id} team={t} onApply={handleApply} />
                    ))}
                    
                    {filteredTeams.length === 0 && (
                      <div className="col-span-2 text-center py-20 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                         {searchQuery || activeFilter !== 'All' 
                            ? "No squads found matching your filters." 
                            : "No other squads found yet."}
                      </div>
                    )}
                </div>
            </div>
        )}

        {/* 3. INBOX VIEW (Same as before) */}
        {activeTab === 'inbox' && (
            <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">All caught up. No new alerts.</div>
                ) : (
                  notifications.map((n: any) => (
                    <div key={n.id} className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-5 rounded-lg border border-white/10 hover:border-blue-500/50 transition">
                        <div className="mb-4 sm:mb-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${n.type === 'invite' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                {n.type}
                              </span>
                              <span className="text-gray-500 text-xs">{new Date(n.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="text-lg font-medium">{n.message}</div>
                        </div>
                        <div className="flex gap-3">
                           <button onClick={() => handleRejectNotif(n)} className="px-4 py-2 rounded text-sm font-bold text-gray-400 hover:bg-white/10">Dismiss</button>
                           <button onClick={() => handleAcceptNotif(n)} className="px-6 py-2 rounded text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">ACCEPT</button>
                        </div>
                    </div>
                  ))
                )}
            </div>
        )}

      </div>
    </div>
  );
}