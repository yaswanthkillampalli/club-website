'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { applyToClub } from '@/lib/api/clubs';
import { Users, ArrowRight, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ClubCardProps {
  club: any;
  membership?: { status: string, role: string }; // The user's status in THIS club
}

export default function ClubCard({ club, membership }: ClubCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(membership?.status || null);

  const handleApply = async () => {
    setLoading(true);
    try {
      await applyToClub(club.id);
      setStatus('pending'); // Optimistic update
      toast.success(`Application sent to ${club.name}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition flex flex-col h-full">
      
      {/* Banner Image */}
      <div className="h-32 bg-gray-800 relative overflow-hidden">
        {club.banner_url ? (
            <img 
                src={club.banner_url} 
                alt={club.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-900 to-purple-900">
                <Users className="text-white/20 h-12 w-12" />
            </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white">
            {club.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white mb-2">{club.name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
            {club.description}
        </p>

        {/* Dynamic Action Button */}
        {status === 'active' ? (
            <button 
                onClick={() => router.push(`/clubs/${club.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
            >
                ENTER CLUB <ArrowRight className="h-4 w-4" />
            </button>
        ) : status === 'pending' ? (
            <button 
                disabled
                className="w-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
            >
                <Clock className="h-4 w-4" /> PENDING APPROVAL
            </button>
        ) : (
            <button 
                onClick={handleApply}
                disabled={loading}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
            >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'APPLY TO JOIN'}
            </button>
        )}
      </div>
    </div>
  );
}