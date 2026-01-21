'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchMonthEvents() {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

      const { data } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', startOfMonth)
        .lte('event_date', endOfMonth);

      setEvents(data || []);
    }
    fetchMonthEvents();
  }, [currentDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getEventsForDay = (day: number) => events.filter(e => new Date(e.event_date).getDate() === day);

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white">
      {/* Reduced Max Width to 5xl to keep it tighter */}
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row gap-6">
        
        {/* LEFT: THE COMPACT GRID */}
        <div className="flex-1">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-green-500 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" /> ACADEMIC_LOG
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono font-bold text-gray-300">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <div className="flex gap-1">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 rounded hover:bg-white/10 border border-white/10">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 rounded hover:bg-white/10 border border-white/10">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          {/* The Grid - NOW COMPACT */}
          <div className="grid grid-cols-7 gap-1">
            
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 lg:h-20" /> 
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
              const isSelected = selectedDate === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  // CHANGED: Removed aspect-square, used fixed height (h-14 on mobile, h-20 on desktop)
                  className={`relative h-14 lg:h-20 rounded border flex flex-col items-center justify-start pt-2 transition-all ${
                    isSelected 
                      ? 'bg-green-900/30 border-green-500 text-white' 
                      : isToday 
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span className={`text-xs font-bold ${isSelected || isToday ? 'text-white' : ''}`}>
                    {day}
                  </span>

                  {/* Dots are now smaller and centered */}
                  <div className="flex gap-1 mt-1.5 justify-center">
                    {dayEvents.map((ev, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 w-1.5 rounded-full ${
                          ev.event_type === 'hackathon' ? 'bg-purple-500' : 'bg-blue-500'
                        }`} 
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: DETAILS PANEL */}
        <div className="w-full md:w-80">
          <div className="rounded-xl border border-white/10 bg-neutral-900/50 p-5 backdrop-blur-sm h-full min-h-[300px]">
            
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              {selectedDate 
                ? `${monthNames[currentDate.getMonth()]} ${selectedDate}` 
                : "Select Date"}
            </h2>

            {selectedDate ? (
              <div className="space-y-3">
                {getEventsForDay(selectedDate).length === 0 ? (
                  <div className="text-center text-gray-600 text-xs py-8">
                    No events scheduled.
                  </div>
                ) : (
                  getEventsForDay(selectedDate).map(event => (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={event.id} 
                      className="rounded border border-white/10 bg-black p-3 hover:border-green-500/50 transition"
                    >
                      <div className={`text-[10px] font-bold uppercase mb-1 ${
                        event.event_type === 'hackathon' ? 'text-purple-400' : 'text-blue-400'
                      }`}>
                        {event.event_type}
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">
                        {event.title}
                      </h3>
                      
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.event_date).toLocaleTimeString('en-US', { hour: 'numeric', minute:'2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-600 text-xs">
                <CalendarIcon className="h-8 w-8 mb-2 opacity-20" />
                <p>Click a date to view details.</p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
}