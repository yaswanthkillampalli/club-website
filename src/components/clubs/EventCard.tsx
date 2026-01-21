'use client'
import { useState } from 'react';
import { cancelRegistration } from '@/lib/api/clubs';
import EventRegistrationModal from './EventRegistrationModal'; 
import AttendanceModal from './AttendanceModal';
import { Calendar, MapPin, Clock, CheckCircle, Video, Users, Ticket, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

// FIX 1: Add 'isAdmin' to the props destructuring
export default function EventCard({ event, isAdmin }: any) { 
  
  // 1. STATE
  const [status, setStatus] = useState(event.my_status); 
  const [count, setCount] = useState(event.attendees_count);
  const [showModal, setShowModal] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);

  const date = new Date(event.event_date);
  const isFull = event.max_capacity && count >= event.max_capacity;

  // 2. HANDLE CANCELLATION
  const handleCancel = async () => {
      if(!confirm("Cancel your registration?")) return;
      try {
        await cancelRegistration(event.id);
        setStatus(null);
        setCount((prev: number) => prev - 1);
        toast.success("Registration cancelled");
      } catch(err) {
        toast.error("Failed to cancel");
      }
  };

  return (
    <>
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition flex flex-col md:flex-row gap-6">
      
      {/* Date Box */}
      <div className="bg-black/40 border border-white/10 rounded-lg w-full md:w-24 h-24 flex flex-col items-center justify-center shrink-0">
         <span className="text-red-500 font-bold text-xs uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
         <span className="text-3xl font-bold text-white">{date.getDate()}</span>
      </div>

      {/* Details */}
      <div className="flex-1">
         <div className="flex justify-between items-start">
             <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
             {event.is_public && <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold">Public</span>}
         </div>
         
         <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-1">
                {event.is_online ? <Video className="h-4 w-4 text-purple-400" /> : <MapPin className="h-4 w-4 text-red-400" />}
                {event.location || (event.is_online ? "Online Link" : "TBA")}
            </div>
         </div>
         
         <p className="text-gray-300 text-sm leading-relaxed mb-4">{event.description}</p>
         
         {/* Footer Buttons */}
         <div className="flex items-center justify-between pt-4 border-t border-white/5">
             
             {/* Left: Count & Admin Button */}
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                     <Users className="h-4 w-4" />
                     {count} / {event.max_capacity || '∞'} enrolled
                 </div>

                 {/* Admin Attendance Button (Now works!) */}
                 {isAdmin && (
                    <button 
                        onClick={() => setShowAttendance(true)}
                        className="bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-2 hover:bg-purple-600/30 transition"
                    >
                        <ClipboardList className="h-3 w-3" /> ATTENDANCE
                    </button>
                )}
             </div>

             {/* Right: Register Button */}
             {status === 'registered' ? (
                 <button 
                    onClick={handleCancel} 
                    className="bg-green-600/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-green-600/30 transition"
                 >
                    <CheckCircle className="h-4 w-4" /> REGISTERED
                 </button>
             ) : isFull ? (
                 <button disabled className="bg-gray-800 text-gray-500 px-4 py-2 rounded-lg font-bold text-sm cursor-not-allowed flex items-center gap-2">
                    SOLD OUT
                 </button>
             ) : (
                 <button 
                    onClick={() => setShowModal(true)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2"
                 >
                    <Ticket className="h-4 w-4" /> REGISTER
                 </button>
             )}
         </div>
      </div>
    </div>

    {/* Modals */}
    <EventRegistrationModal 
        event={event} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSuccess={() => {
            setStatus('registered');
            setCount((prev: number) => prev + 1);
        }} 
    />

    <AttendanceModal 
        event={event} 
        isOpen={showAttendance} 
        onClose={() => setShowAttendance(false)} 
    />
    </>
  );
}