import { Trophy } from 'lucide-react';

export default function MyRankBar({ rank, user }: { rank: number, user: any }) {
  if (!user || rank === -1) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-40">
      <div className="bg-[#111] border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)] rounded-full px-8 py-3 flex items-center gap-6 text-white backdrop-blur-md">
        
        <div className="flex items-center gap-3">
          <img src={user.avatar_url} className="h-8 w-8 rounded-full border border-white/20" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Your Rank</span>
            <span className="font-bold text-yellow-400 text-lg flex items-center gap-1">
              #{rank} <Trophy className="h-3 w-3" />
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10"></div>

        <div className="flex flex-col">
           <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">XP Earned</span>
           <span className="font-mono font-bold text-white">{user.global_xp}</span>
        </div>

      </div>
    </div>
  );
}