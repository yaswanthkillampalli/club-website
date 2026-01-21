'use client'
import { useState, useEffect } from 'react';
import { getGlobalEvents } from '@/lib/api/events';
import EventCard from '@/components/clubs/EventCard'; // Reusing your card!
import { CalendarDays, Filter, Search } from 'lucide-react';

export default function GlobalEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filter, setFilter] = useState<'all' | 'public' | 'my-clubs'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const data = await getGlobalEvents();
      setEvents(data || []);
      setLoading(false);
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-blue-500">Loading Events...</div>;

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                    <CalendarDays className="h-8 w-8 text-purple-500" /> CAMPUS_EVENTS
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
            {[
                { id: 'all', label: 'All Events' },
                { id: 'public', label: 'Public / Open' },
                { id: 'my-clubs', label: 'My Club Meetings' },
            ].map(f => (
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
        </div>

        {/* Events Grid */}
        <div className="space-y-4">
            {filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500">
                    No events found matching your filter.
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