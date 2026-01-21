'use client'
import { useState, useEffect } from 'react';
import { getEventAttendees, markUserPresent } from '@/lib/api/clubs';
import { X, Check, Loader2, User, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceModal({ event, isOpen, onClose }: any) {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) loadAttendees();
  }, [isOpen]);

  const loadAttendees = async () => {
    setLoading(true);
    const data = await getEventAttendees(event.id);
    setAttendees(data);
    setLoading(false);
  };

  const handleMarkPresent = async (userId: string) => {
    try {
        await markUserPresent(event.id, userId);
        toast.success("Marked Present (+50 XP)");
        
        // Update local state to show green check immediately
        setAttendees(prev => prev.map(a => 
            a.user_id === userId ? { ...a, status: 'attended' } : a
        ));
    } catch (err: any) {
        toast.error("Failed to update");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-lg h-[80vh] flex flex-col relative shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white">Attendance Sheet</h2>
                <p className="text-xs text-gray-400">{event.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {loading ? (
                <div className="text-center py-10 text-blue-500"><Loader2 className="animate-spin mx-auto"/> Loading List...</div>
            ) : attendees.length === 0 ? (
                <div className="text-center py-10 text-gray-500 italic">No registrations yet.</div>
            ) : (
                attendees.map(record => (
                    <div key={record.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                                {record.profiles.avatar_url ? (
                                    <img src={record.profiles.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-gray-500">{record.profiles.username[0]}</span>
                                )}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm">{record.profiles.full_name}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Trophy className="h-3 w-3 text-yellow-600" /> {record.profiles.global_xp} XP
                                </div>
                            </div>
                        </div>

                        {record.status === 'attended' ? (
                            <div className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-bold flex items-center gap-1">
                                <Check className="h-3 w-3" /> PRESENT
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleMarkPresent(record.user_id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition shadow-lg shadow-blue-900/20"
                            >
                                CHECK IN
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
        
        <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
            Checking in adds +50 XP to the student's profile instantly.
        </div>
      </div>
    </div>
  );
}