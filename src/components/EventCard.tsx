'use client'
import { Calendar, MapPin, Terminal } from 'lucide-react';
import { useState } from 'react';
import { registerForEvent } from '@/lib/api/clubs';

export default function EventCard({ event, userId }: { event: any, userId?: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleRegister = async () => {
    if (!userId) {
      alert("Please login first!");
      return;
    }
    
    setStatus('loading');
    try {
      await registerForEvent(event.id);
      setStatus('success');
    } catch (err: any) {
      alert(err.message); // e.g. "Already registered"
      setStatus('error');
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-green-500/50">
      
      {/* 1. Header: Date & Type */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
            event.event_type === 'hackathon' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
          }`}>
            {event.event_type}
          </span>
          <h3 className="mt-2 text-2xl font-bold text-white group-hover:text-green-400 transition">
            {event.title}
          </h3>
        </div>
        
        {/* Date Box */}
        <div className="text-center bg-white/10 rounded p-2 min-w-15">
          <div className="text-xs text-gray-400 uppercase">
            {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
          </div>
          <div className="text-xl font-bold text-white">
            {new Date(event.event_date).getDate()}
          </div>
        </div>
      </div>

      {/* 2. The "Terminal" Code Block */}
      {event.code_snippet && (
        <div className="my-4 rounded-md bg-black p-3 font-mono text-xs text-gray-300 border border-white/10 shadow-inner">
          <div className="flex gap-1.5 mb-2 opacity-50">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <pre className="overflow-x-auto">
            <code>{event.code_snippet}</code>
          </pre>
        </div>
      )}

      {/* 3. Details */}
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {event.location}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {/* NEW (Fixed) */}
            {new Date(event.event_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </div>
      </div>

      {/* 4. Action Button */}
      <button 
        onClick={handleRegister}
        disabled={status === 'success' || status === 'loading'}
        className={`w-full py-2 rounded font-bold transition flex items-center justify-center gap-2 ${
          status === 'success' 
            ? 'bg-green-600 text-white cursor-default' 
            : 'bg-white text-black hover:bg-gray-200'
        }`}
      >
        {status === 'loading' && "PROCESSING..."}
        {status === 'success' && "REGISTERED ✓"}
        {status === 'idle' && (
          <>
            <Terminal className="w-4 h-4" />
            RSVP NOW
          </>
        )}
      </button>
    </div>
  );
}