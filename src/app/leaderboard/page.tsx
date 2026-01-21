'use client'
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trophy } from 'lucide-react';

// Import our new clean components
import Podium from '@/components/leaderboard/Podium';
import RankTable from '@/components/leaderboard/RankTable';
import MyRankBar from '@/components/leaderboard/MyRankBar';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function getData() {
      // 1. Get Me
      const { data: { user } } = await supabase.auth.getUser();
      
      // 2. Get Everyone (Sorted by XP)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('global_xp', { ascending: false })
        .limit(100); // Fetch top 100 to increase chance of finding user
      
      // 3. Find My Profile details from the list
      if (user) {
        // If I am in the top 100, use that data. If not, fetch my profile specifically.
        const myProfileInList = data?.find(u => u.id === user.id);
        if (myProfileInList) {
          setCurrentUser(myProfileInList);
        } else {
           const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
           setCurrentUser(myProfile);
        }
      }

      setUsers(data || []);
      setLoading(false);
    }
    getData();
  }, []);

  if (loading) return <div className="min-h-screen bg-black pt-24 text-center text-gray-500">Calculating rankings...</div>;

  // Calculate my rank
  // (Index + 1 because arrays start at 0)
  const myRank = users.findIndex(u => u.id === currentUser?.id) + 1;

  // Split Data
  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white pb-20">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tighter text-yellow-500 flex items-center justify-center gap-3">
            <Trophy className="h-10 w-10" /> HALL OF FAME
          </h1>
          <p className="text-gray-400 mt-2">Top contributors based on shipping code and earning respect.</p>
        </div>

        {/* 1. The Podium Component */}
        <Podium topThree={topThree} />

        {/* 2. The List Component */}
        <RankTable users={rest} currentUserId={currentUser?.id} />

        {/* 3. The Sticky Rank Bar (New!) */}
        {/* Only show if I have a rank and I am NOT in the top 3 (because Top 3 is already obvious) */}
        {myRank > 3 && (
          <MyRankBar rank={myRank} user={currentUser} />
        )}

      </div>
    </div>
  );
}