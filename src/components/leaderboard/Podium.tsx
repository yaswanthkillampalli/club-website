import { Crown, Medal } from 'lucide-react';

export default function Podium({ topThree }: { topThree: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
      
      {/* 2nd Place */}
      {topThree[1] && (
        <div className="order-2 md:order-1 flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-gray-800 to-black border border-gray-600 relative top-4">
          <Medal className="h-8 w-8 text-gray-300 mb-4" />
          <img src={topThree[1].avatar_url} className="h-20 w-20 rounded-full border-4 border-gray-400" />
          <div className="mt-4 text-center font-bold text-xl">{topThree[1].username}</div>
          <div className="text-gray-400 font-mono text-sm">{topThree[1].global_xp} XP</div>
          <div className="absolute -bottom-4 bg-gray-700 text-white font-bold px-4 py-1 rounded-full border border-gray-500">#2</div>
        </div>
      )}

      {/* 1st Place */}
      {topThree[0] && (
        <div className="order-1 md:order-2 flex flex-col items-center p-8 rounded-2xl bg-gradient-to-b from-yellow-900/50 to-black border border-yellow-500 relative z-10 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
          <Crown className="h-12 w-12 text-yellow-400 mb-4 animate-bounce" />
          <img src={topThree[0].avatar_url} className="h-28 w-28 rounded-full border-4 border-yellow-500 shadow-xl" />
          <div className="mt-6 text-center font-bold text-2xl text-yellow-100">{topThree[0].username}</div>
          <div className="text-yellow-500 font-mono font-bold text-lg">{topThree[0].global_xp} XP</div>
          <div className="absolute -bottom-5 bg-yellow-600 text-black font-extrabold px-6 py-2 rounded-full border-2 border-yellow-400">#1 CHAMPION</div>
        </div>
      )}

      {/* 3rd Place */}
      {topThree[2] && (
        <div className="order-3 md:order-3 flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-orange-900/30 to-black border border-orange-700 relative top-4">
          <Medal className="h-8 w-8 text-orange-400 mb-4" />
          <img src={topThree[2].avatar_url} className="h-20 w-20 rounded-full border-4 border-orange-600" />
          <div className="mt-4 text-center font-bold text-xl">{topThree[2].username}</div>
          <div className="text-orange-400 font-mono text-sm">{topThree[2].global_xp} XP</div>
          <div className="absolute -bottom-4 bg-orange-800 text-orange-100 font-bold px-4 py-1 rounded-full border border-orange-600">#3</div>
        </div>
      )}
    </div>
  );
}