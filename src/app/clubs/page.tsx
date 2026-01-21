'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getAllClubs, getMyMemberships } from '@/lib/api/clubs';
import { LayoutGrid, Search, Filter } from 'lucide-react';
import ClubCard from '@/components/clubs/ClubCard';

export default function ClubsDirectoryPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]); // To store my status
  const [loading, setLoading] = useState(true);

  // Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch Clubs
      const clubsData = await getAllClubs();
      setClubs(clubsData);

      // 2. Fetch My Status (if logged in)
      if (user) {
        const myData = await getMyMemberships(user.id);
        setMemberships(myData);
      }
      
      setLoading(false);
    }
    init();
  }, []);

  // Filter Logic
  const categories = ['All', ...Array.from(new Set(clubs.map(c => c.category)))];
  
  const filteredClubs = clubs.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || c.category === category;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Directory...</div>;

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight flex items-center justify-center gap-3">
                <LayoutGrid className="h-10 w-10 text-blue-500" /> CLUB_DIRECTORY
            </h1>
            <p className="text-gray-400 text-lg">
                Join a specialized unit. Contribute to projects. Rise through the ranks.
            </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-4xl mx-auto">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Find a club..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 text-white focus:border-blue-500 outline-none transition"
                />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition border ${
                            category === cat 
                            ? 'bg-blue-600 text-white border-blue-500' 
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map(club => {
                // Find my specific membership for this club
                const myMemberData = memberships.find(m => m.club_id === club.id);

                return (
                    <ClubCard 
                        key={club.id} 
                        club={club} 
                        membership={myMemberData} 
                    />
                );
            })}
        </div>

        {filteredClubs.length === 0 && (
            <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                No clubs found matching your criteria.
            </div>
        )}

      </div>
    </div>
  );
}