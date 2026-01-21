export default function RankTable({ users, currentUserId }: { users: any[], currentUserId: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm mb-24">
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-bold text-gray-500 uppercase tracking-widest">
        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
        <div className="col-span-7 md:col-span-8">Member</div>
        <div className="col-span-3 text-right">XP Score</div>
      </div>

      {users.map((user, index) => {
        const rank = index + 4;
        const isMe = currentUserId === user.id;

        return (
          <div key={user.id} className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 last:border-0 ${isMe ? 'bg-blue-900/30 border-blue-500/50' : ''}`}>
            <div className="col-span-2 md:col-span-1 flex justify-center">
              <span className={`font-mono font-bold ${rank <= 10 ? 'text-white' : 'text-gray-600'}`}>#{rank}</span>
            </div>
            <div className="col-span-7 md:col-span-8 flex items-center gap-4">
              <img src={user.avatar_url || 'https://github.com/identicons/user.png'} className="h-8 w-8 rounded-full bg-black" />
              <div className={`font-bold text-sm ${isMe ? 'text-blue-400' : 'text-gray-300'}`}>{user.username} {isMe && '(YOU)'}</div>
            </div>
            <div className="col-span-3 text-right font-mono text-sm text-yellow-500">{user.global_xp}</div>
          </div>
        );
      })}
    </div>
  );
}