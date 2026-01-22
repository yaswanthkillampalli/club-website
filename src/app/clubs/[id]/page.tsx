'use client'
import { useState, useEffect, use } from 'react'; // <--- 1. Import 'use'
import { useRouter } from 'next/navigation';
import { 
  getClubDetails, 
  getMyClubMembership, 
  getClubAnnouncements, 
  getClubApplicants, 
  processApplication, 
  postAnnouncement,
  getClubMembers,
  getClubEvents,
  createEvent,
  getRegistrationFieldTypes,
  deleteEvent
} from '@/lib/api/clubs';
import { 
  Shield, Users, Bell, Check, X, 
  Megaphone, Loader2, Lock, Plus,Calendar 
} from 'lucide-react';
import { toast } from 'sonner';
import ProfileModal from '@/components/teams/ProfileModal';
import EventCard from '@/components/clubs/EventCard';

// <--- 2. Update Props Definition
export default function ClubDashboard({ params }: { params: Promise<{ id: string }> }) {
  // <--- 3. Unwrap the params using 'use()'
  const { id: clubId } = use(params);

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [club, setClub] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);

  const [membersList, setMembersList] = useState<any[]>([]);

  
  // UI State
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bulletin' | 'hq' | 'members' | 'events'>('bulletin');

  // Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLoc, setEventLoc] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [maxCap, setMaxCap] = useState('50');
  const [isPublic, setIsPublic] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [registrationFields, setRegistrationFields] = useState<any[]>([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [posting, setPosting] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  // 1. INITIAL LOAD
  useEffect(() => {
    async function init() {
      if (!clubId) return; // Wait for ID

      try {
        // A. Fetch Club Info
        const clubData = await getClubDetails(clubId);
        setClub(clubData);

        // B. Check Permissions
        const myMem = await getMyClubMembership(clubId);
        
        // If not a member or still pending, kick them out
        if (!myMem || myMem.status !== 'active') {
          toast.error("Access Denied: Members Only");
          router.push('/clubs'); 
          return;
        }
        
        setMembership(myMem);

        // C. Fetch Content
        const posts = await getClubAnnouncements(clubId);
        setAnnouncements(posts);

        // D. Fetch Admin Data (if admin)
        if (['admin', 'moderator'].includes(myMem.role)) {
            const apps = await getClubApplicants(clubId);
            setApplicants(apps);
        }

        // E. Fetch Active Members (New)
        const activeMembers = await getClubMembers(clubId);
        setMembersList(activeMembers);

        // F. Fetch Events
        const events = await getClubEvents(clubId);
        setEventsList(events);

        // G. Fetch available registration field types
        const fields = await getRegistrationFieldTypes();
        setRegistrationFields(fields);
        
        // Pre-select default fields (first 4: full_name, phone, branch, year)
        const defaultFieldIds = fields
          .filter(f => ['full_name', 'phone', 'branch', 'year'].includes(f.name))
          .map(f => f.id);
        setSelectedFieldIds(defaultFieldIds);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load club HQ");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [clubId, router]); // Dependency is now the unwrapped clubId

  // 2. HANDLERS
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
        await postAnnouncement(club.id, newTitle, newContent);
        toast.success("Announcement posted");
        setNewTitle('');
        setNewContent('');
        
        // Refresh list
        const posts = await getClubAnnouncements(club.id);
        setAnnouncements(posts);
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setPosting(false);
    }
  };

  const handleApplicant = async (memId: string, action: 'accept' | 'reject') => {
      try {
          await processApplication(memId, action);
          toast.success(`Application ${action}ed`);
          setApplicants(prev => prev.filter(a => a.id !== memId));
      } catch (err: any) {
          toast.error(err.message);
      }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-500">Entering Secure Channel...</div>;

  // <--- 4. Crash Prevention: Ensure membership exists before checking role
  if (!membership) return null; 

  const isAdmin = ['admin', 'moderator'].includes(membership.role);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await createEvent({
            club_id: clubId,
            title: eventTitle,
            start_time: new Date(eventStartTime).toISOString(),
            end_time: new Date(eventEndTime).toISOString(),
            location: eventLoc,
            description: eventDesc,
            max_capacity: parseInt(maxCap) || 50,
            is_public: isPublic,
            is_online: isOnline,
            registrationFieldIds: selectedFieldIds
        });
        
        toast.success("Event Published!");
        setShowEventForm(false);
        
        // Reset Form
        setEventTitle('');
        setEventStartTime('');
        setEventEndTime('');
        setEventLoc('');
        setEventDesc('');
        setMaxCap('50');
        setIsPublic(false);
        setIsOnline(false);
        // Reset to default field UUIDs after refreshing
        const defaultFieldIds = registrationFields
          .filter(f => ['full_name', 'phone', 'branch', 'year'].includes(f.name))
          .map(f => f.id);
        setSelectedFieldIds(defaultFieldIds);

        // Refresh List
        const updated = await getClubEvents(clubId);
        setEventsList(updated);
    } catch (err: any) {
        toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10 mb-8">
            <div className="h-40 md:h-56 bg-linear-to-r from-blue-900 to-black relative">
                 {club?.banner_url && <img src={club.banner_url} className="w-full h-full object-cover opacity-60" />}
                 <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent"></div>
                 
                 <div className="absolute bottom-6 left-6 md:left-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{club?.name}</h1>
                    <div className="flex items-center gap-3 text-sm font-mono text-gray-300">
                        <span className="bg-blue-600 px-2 py-0.5 rounded text-white font-bold">{club?.category}</span>
                        <span className="flex items-center gap-1"><Users className="h-4 w-4"/> PRIVATE CHANNEL</span>
                    </div>
                 </div>
            </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-6 border-b border-white/10 mb-8">
            <button 
                onClick={() => setActiveTab('bulletin')}
                className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'bulletin' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500'}`}
            >
                <Megaphone className="h-4 w-4" /> BULLETIN BOARD
            </button>

            <button 
                onClick={() => setActiveTab('members')}
                className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'members' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500'}`}
            >
                <Users className="h-4 w-4" /> MEMBERS ({membersList.length})
            </button>

            <button 
                onClick={() => setActiveTab('events')}
                className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'events' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500'}`}
            >
                <Calendar className="h-4 w-4" /> EVENTS
            </button>
            
            {isAdmin && (
                <button 
                    onClick={() => setActiveTab('hq')}
                    className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'hq' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500'}`}
                >
                    <Shield className="h-4 w-4" /> COMMAND CENTER
                    {applicants.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{applicants.length}</span>}
                </button>
            )}
        </div>

        {/* VIEW: BULLETIN BOARD */}
        {activeTab === 'bulletin' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {announcements.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500">
                            No announcements yet.
                        </div>
                    ) : (
                        announcements.map(post => (
                            <div key={post.id} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-blue-500/30 transition">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                                    <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-500 font-mono uppercase">
                                    <div className="h-5 w-5 rounded-full bg-blue-900 flex items-center justify-center text-blue-200 font-bold">
                                        {post.author?.full_name?.[0] || 'A'}
                                    </div>
                                    Posted by {post.author?.full_name || 'Unknown'}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar (Post Box) */}
                <div className="lg:col-span-1">
                    {isAdmin ? (
                        <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-xl sticky top-24">
                            <h3 className="text-sm font-bold text-blue-400 uppercase mb-4 flex items-center gap-2">
                                <Plus className="h-4 w-4" /> New Announcement
                            </h3>
                            <form onSubmit={handlePost} className="space-y-4">
                                <input 
                                    required
                                    placeholder="Title..."
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full bg-black border border-blue-500/30 rounded p-3 text-white focus:border-blue-500 outline-none"
                                />
                                <textarea 
                                    required
                                    placeholder="Message to all members..."
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    className="w-full bg-black border border-blue-500/30 rounded p-3 text-white h-32 resize-none focus:border-blue-500 outline-none"
                                />
                                <button 
                                    disabled={posting}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2 transition"
                                >
                                    {posting ? <Loader2 className="animate-spin h-4 w-4" /> : 'POST UPDATE'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
                            <Lock className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Only Club Admins can post announcements.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* VIEW: HQ (ADMIN ONLY) */}
        {activeTab === 'hq' && isAdmin && (
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-black/20">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Users className="text-blue-500" /> Pending Applications ({applicants.length})
                    </h3>
                </div>
                
                {applicants.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No pending requests at this time.</div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {applicants.map(app => (

                            <div 
                                key={app.id} 
                                className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/5 transition cursor-pointer group border-b border-white/5 last:border-0"
                                onClick={() => setSelectedProfile(app.profiles)} // <--- CLICK TO OPEN MODAL
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-blue-500 transition">
                                            {app.profiles.avatar_url ? (
                                            <img src={app.profiles.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                            <span className="font-bold text-gray-500">{app.profiles.username?.[0]}</span>
                                            )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg group-hover:text-blue-400 transition flex items-center gap-2">
                                            {app.profiles.full_name}
                                            {/* Small indicator if they have a bio */}
                                            {app.profiles.bio && <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 rounded">Bio</span>}
                                        </h4>
                                        <div className="text-sm text-gray-400 font-mono">@{app.profiles.username}</div>
                                        
                                        {/* SNEAK PEEK: Show first 3 skills */}
                                        {app.profiles.tech_stack && (
                                            <div className="flex gap-1 mt-1.5">
                                                {app.profiles.tech_stack.slice(0, 3).map((t: string) => (
                                                    <span key={t} className="text-[10px] bg-blue-900/30 text-blue-300 border border-blue-500/20 px-1.5 rounded">
                                                        {t}
                                                    </span>
                                                ))}
                                                {app.profiles.tech_stack.length > 3 && (
                                                    <span className="text-[10px] text-gray-500">+{app.profiles.tech_stack.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Stop click from opening profile
                                            handleApplicant(app.id, 'reject');
                                        }}
                                        className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-sm flex items-center gap-2 transition"
                                    >
                                        <X className="h-4 w-4" /> REJECT
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Stop click from opening profile
                                            handleApplicant(app.id, 'accept');
                                        }}
                                        className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-sm flex items-center gap-2 transition shadow-lg shadow-green-900/20"
                                    >
                                        <Check className="h-4 w-4" /> APPROVE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* VIEW: MEMBERS ROSTER */}
        {activeTab === 'members' && (
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-black/20">
                    <h3 className="font-bold text-lg text-white">Squad Roster</h3>
                    <p className="text-gray-500 text-xs">Hierarchy: Admins &gt; Moderators &gt; Agents</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {membersList
                        .sort((a, b) => {
                            const roleOrder: any = { admin: 3, moderator: 2, member: 1 };
                            return roleOrder[b.role] - roleOrder[a.role]; // Sort Descending
                        })
                        .map(member => (
                            <div 
                                key={member.id} 
                                onClick={() => setSelectedProfile(member.profiles)}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition cursor-pointer group ${
                                    member.role === 'admin' 
                                    ? 'bg-blue-900/10 border-blue-500/30 hover:bg-blue-900/20' 
                                    : member.role === 'moderator'
                                    ? 'bg-purple-900/10 border-purple-500/30 hover:bg-purple-900/20'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                            >
                                {/* Avatar */}
                                <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-white/10">
                                    {member.profiles.avatar_url ? (
                                        <img src={member.profiles.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-gray-500">{member.profiles.username?.[0]}</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white group-hover:text-blue-400 transition">
                                            {member.profiles.full_name}
                                        </h4>
                                        {/* Role Badge */}
                                        {member.role === 'admin' && <span className="text-[10px] bg-blue-600 text-white px-1.5 rounded font-bold">ADMIN</span>}
                                        {member.role === 'moderator' && <span className="text-[10px] bg-purple-600 text-white px-1.5 rounded font-bold">MOD</span>}
                                    </div>
                                    <div className="text-sm text-gray-400 font-mono">@{member.profiles.username}</div>
                                    
                                    {/* Tech Stack Sneak Peek */}
                                    {member.profiles.tech_stack && (
                                        <div className="flex gap-1 mt-1">
                                            {member.profiles.tech_stack.slice(0, 3).map((t: string) => (
                                                <span key={t} className="text-[10px] bg-white/10 text-gray-500 px-1 rounded">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* VIEW: EVENTS */}
        {activeTab === 'events' && (
            <div className="space-y-6">
                
                {/* Header & Create Button */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Upcoming Sessions</h2>
                    {isAdmin && (
                        <button 
                            onClick={() => setShowEventForm(!showEventForm)} 
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition"
                        >
                            <Plus className="h-4 w-4" /> {showEventForm ? 'CANCEL' : 'SCHEDULE EVENT'}
                        </button>
                    )}
                </div>

                {/* Create Form (Toggle) */}
                {showEventForm && (
                    <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                        <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 font-bold uppercase ml-1">Event Title</label>
                                <input required placeholder="e.g. AI Workshop" value={eventTitle} onChange={e=>setEventTitle(e.target.value)} className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-blue-500 mt-1" />
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase ml-1">Start Date & Time</label>
                                <input required type="datetime-local" value={eventStartTime} onChange={e=>setEventStartTime(e.target.value)} className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-blue-500 mt-1" />
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase ml-1">End Date & Time</label>
                                <input required type="datetime-local" value={eventEndTime} onChange={e=>setEventEndTime(e.target.value)} className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-blue-500 mt-1" />
                            </div>

                            {/* Location */}
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 font-bold uppercase ml-1">Location / Link</label>
                                <input required placeholder="Room 304 or Zoom Link" value={eventLoc} onChange={e=>setEventLoc(e.target.value)} className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-blue-500 mt-1" />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 font-bold uppercase ml-1">Description</label>
                                <textarea required placeholder="What will happen?" value={eventDesc} onChange={e=>setEventDesc(e.target.value)} className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-blue-500 h-20 resize-none mt-1" />
                            </div>

                            {/* Public Toggle (NEW) */}
                            <div className="md:col-span-2 bg-black/40 p-3 rounded border border-white/10 flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    id="isPublic"
                                    checked={isPublic} 
                                    onChange={e=>setIsPublic(e.target.checked)} 
                                    className="h-5 w-5 accent-blue-600 cursor-pointer" 
                                />
                                <label htmlFor="isPublic" className="cursor-pointer">
                                    <span className="block text-sm text-white font-bold">Public Event</span>
                                    <span className="block text-xs text-gray-400">If checked, this event will appear on the global events page for everyone.</span>
                                </label>
                            </div>

                            {/* Online Toggle (NEW) */}
                            <div className="md:col-span-2 bg-black/40 p-3 rounded border border-white/10 flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    id="isOnline"
                                    checked={isOnline} 
                                    onChange={e=>setIsOnline(e.target.checked)} 
                                    className="h-5 w-5 accent-blue-600 cursor-pointer" 
                                />
                                <label htmlFor="isOnline" className="cursor-pointer">
                                    <span className="block text-sm text-white font-bold">Online Event</span>
                                    <span className="block text-xs text-gray-400">Check if this is a virtual/online event.</span>
                                </label>
                            </div>

                            {/* Registration Fields Selector (NEW) */}
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 font-bold uppercase ml-1 block mb-3">Registration Fields Required</label>
                                <div className="bg-black/40 p-4 rounded border border-white/10 space-y-3 max-h-48 overflow-y-auto">
                                    {registrationFields.map(field => (
                                        <div key={field.id} className="flex items-center justify-between bg-black/50 p-3 rounded border border-white/5 hover:border-white/10 transition">
                                            <div className="flex-1">
                                                <label className="text-sm text-white cursor-pointer font-medium block">
                                                    {field.label}
                                                </label>
                                                <span className="text-xs text-gray-500">{field.input_type}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (selectedFieldIds.includes(field.id)) {
                                                        setSelectedFieldIds(selectedFieldIds.filter(id => id !== field.id));
                                                    } else {
                                                        setSelectedFieldIds([...selectedFieldIds, field.id]);
                                                    }
                                                }}
                                                className={`ml-4 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                                                    selectedFieldIds.includes(field.id)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                }`}
                                            >
                                                {selectedFieldIds.includes(field.id) ? 'ON' : 'OFF'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Toggle which fields users must fill when registering.</p>
                            </div>

                            <button className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded font-bold md:col-span-2 transition mt-2">PUBLISH EVENT</button>
                        </form>
                    </div>
                )}

                {/* Events List */}
                <div className="space-y-4">
                    {eventsList.length === 0 && !showEventForm && (
                        <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500">
                            No events scheduled yet.
                        </div>
                    )}
                    
                    {eventsList.map(event => (
                        <EventCard 
                            key={event.id} 
                            event={event} 
                            isAdmin={isAdmin}
                            onDelete={(eventId: string) => {
                                setEventsList(eventsList.filter(e => e.id !== eventId));
                            }}
                        />
                    ))}
                </div>
            </div>
        )}

        </div>
        <ProfileModal 
            isOpen={!!selectedProfile} 
            profile={selectedProfile} 
            onClose={() => setSelectedProfile(null)} 
        />
    </div>
  );
}