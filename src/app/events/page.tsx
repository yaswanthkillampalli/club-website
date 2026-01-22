'use client'
import { useState, useEffect } from 'react';
import { getGlobalEvents } from '@/lib/api/events';
import { getMyMemberships } from '@/lib/api/clubs';
import { createClient } from '@/utils/supabase/client';
import EventCard from '@/components/clubs/EventCard'; // Reusing your card!
import { CalendarDays, Filter, Search, LogIn } from 'lucide-react';

export default function GlobalEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  
  // Filters
  const [filter, setFilter] = useState<'all' | 'public' | 'my-clubs'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        setUser(user || null);

        // Fetch events
        const eventData = await getGlobalEvents();
        setEvents(eventData || []);

        // Fetch user's club memberships if logged in
        if (user?.id) {
          const memberships = await getMyMemberships(user.id);
          setUserClubs(memberships || []);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter Logic
  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'public') return matchesSearch && ev.is_public;
    if (filter === 'my-clubs') return matchesSearch && !ev.is_public; // Private = My Clubs
    return matchesSearch;
  });

  // Build filter tabs dynamically
  const filterTabs = [
    { id: 'all', label: 'All Events' },
    { id: 'public', label: 'Public / Open' },
  ];
  
  // Only show "My Club Meetings" if user is logged in and has clubs
  if (user && userClubs.length > 0) {
    filterTabs.push({ id: 'my-clubs', label: 'My Club Meetings' });
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-blue-500">Loading Events...</div>;

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                    <CalendarDays className="h-8 w-8 text-purple-500" /> CLUB EVENTS
                </h1>
                <p className="text-gray-400 text-sm">Discover workshops, hackathons, and club meetups.</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input 
                    placeholder="Search events..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 text-white focus:border-purple-500 outline-none transition"
                />
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 border-b border-white/10">
            {filterTabs.map(f => (
                <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`pb-2 text-sm font-bold whitespace-nowrap transition border-b-2 ${
                        filter === f.id 
                        ? 'border-purple-500 text-purple-400' 
                        : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                >
                    {f.label}
                </button>
            ))}
            
            {/* Show login prompt if not logged in */}
            {!user && (
                <div className="ml-auto flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded border border-white/10">
                    <LogIn className="h-3 w-3" />
                    <span>Login to see your clubs</span>
                </div>
            )}
        </div>

        {/* Events Grid */}
        <div className="space-y-4">
            {filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500">
                    <p className="mb-2">No events found matching your filter.</p>
                    {filter === 'my-clubs' && !user && (
                        <p className="text-xs text-gray-600 mt-4">Please log in to view your club events.</p>
                    )}
                </div>
            ) : (
                filteredEvents.map(event => (
                    <div key={event.id} className="relative">
                        {/* Tiny Badge to show who is hosting */}
                        <div className="absolute -top-3 left-4 z-10 bg-black/80 border border-white/20 px-2 py-0.5 rounded text-[10px] font-bold text-gray-300 uppercase tracking-wide">
                            Hosted by {event.club_name || "Platform"}
                        </div>
                        
                        {/* Reuse the Card */}
                        <EventCard event={event}/>
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
}