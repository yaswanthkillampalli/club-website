'use client'
import { useState, useEffect } from 'react';
import { registerForEvent } from '@/lib/api/clubs';
import { getEventRegistrationFields } from '@/lib/api/events';
import { X, Loader2, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function EventRegistrationModal({ event, isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<any[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});

  // --- ⚡ CYBERPUNK SCROLLBAR STYLES ---
  // 1. We force the thumb to be visible with a distinct color (Blue/Purple).
  // 2. We give the track a faint background so you see the scroll area.
  // 3. We assume Dark Mode is primary based on your image.
  const scrollbarStyles = `
    overflow-y-auto pr-3
    
    /* The Scrollbar Lane (Track) */
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-white/5
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-track]:my-2

    /* The Scroll Handle (Thumb) */
    [&::-webkit-scrollbar-thumb]:bg-blue-600
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:border-2
    [&::-webkit-scrollbar-thumb]:border-transparent
    [&::-webkit-scrollbar-thumb]:bg-clip-content
    
    /* Hover Effect */
    hover:[&::-webkit-scrollbar-thumb]:bg-blue-500
  `;

  useEffect(() => {
    if (!isOpen) return;
    
    async function loadFields() {
      try {
        setFieldsLoading(true);
        const eventFields = await getEventRegistrationFields(event.id);
        setFields(eventFields);
        
        const initialData: any = {};
        eventFields.forEach((field: any) => {
          initialData[field.field_type.name] = '';
        });
        setFormData(initialData);
      } catch (err) {
        console.error('Error loading registration fields:', err);
        toast.error('Failed to load registration form');
      } finally {
        setFieldsLoading(false);
      }
    }
    
    loadFields();
  }, [isOpen, event.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerForEvent(event.id, formData);
      toast.success("Spot secured! See you there.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl overflow-hidden">
        {/* Background doodles */}
        <div className="absolute -top-10 -left-8 w-28 h-28 border-2 border-dashed border-blue-400/40 rounded-full blur-sm pointer-events-none" />
        <div className="absolute -bottom-10 -right-6 w-24 h-24 bg-linear-to-br from-blue-500/20 to-purple-500/10 rotate-12 blur pointer-events-none" />
        
        <div className="bg-linear-to-br from-slate-900 via-slate-950 to-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* LEFT COLUMN: Event Info & Rules */}
            {/* NOTICE: h-[60vh] forces the height, ensuring content overflows so scrollbar appears */}
            <div className={`p-6 md:p-8 space-y-6 border-r border-white/10 bg-linear-to-b from-blue-950/30 to-transparent h-[80vh] ${scrollbarStyles}`}>
              
              {/* Event Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600/80 p-2 rounded-lg text-white">
                        <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] tracking-[0.15em] text-blue-300 font-semibold">EVENT DETAILS</p>
                        <h3 className="text-lg font-bold text-white">{event.title}</h3>
                    </div>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Description</p>
                    {/* Added generic text to force overflow for testing */}
                    <p className="text-xs leading-relaxed">
                      {event.description || 'No description available'}
                      <br /><br />
                      This is extra text to ensure the content is long enough to trigger the scrollbar. 
                      If the content is too short, the scrollbar will hide automatically.
                      <br /><br />
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-2">
                    <p className="text-xs text-gray-500 font-bold uppercase">Room Details</p>
                    <div className="text-xs text-gray-300 space-y-1">
                      <p><span className="text-gray-500">📍 Location:</span> {event.location || 'TBA'}</p>
                      <p><span className="text-gray-500">👥 Capacity:</span> {event.max_capacity || '∞'} seats</p>
                      <p><span className="text-gray-500">🔐 Access:</span> {event.is_public ? 'Public Event' : 'Private Event'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules & Guidelines Section */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <p className="text-[10px] tracking-[0.15em] text-purple-300 font-semibold uppercase">Rules & Guidelines</p>
                
                <div className="space-y-2">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-white font-bold mb-1">✓ Check-in Process</p>
                    <p className="text-xs text-gray-300">Register here to secure your spot. Your details will be used for quick check-in.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-white font-bold mb-1">✓ What to Bring</p>
                    <p className="text-xs text-gray-300">Valid ID required. Be on time as per event schedule.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-white font-bold mb-1">✓ Capacity & Seats</p>
                    <p className="text-xs text-gray-300">First-come, first-served. Register early to guarantee your spot.</p>
                  </div>

                  <div className="bg-linear-to-br from-emerald-950/50 to-transparent border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-xs text-emerald-300 font-bold mb-2">🎉 Event Perks</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Attendance certificate</li>
                      <li>• Community points</li>
                      <li>• Event updates & reminders</li>
                      <li>• Networking opportunities</li>
                      <li>• Swag bags for early birds</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Registration Form */}
            {/* Same fixed height h-[60vh] to match the left side */}
            <div className={`p-6 md:p-8 space-y-4 h-[60vh] ${scrollbarStyles}`}>
              <div>
                  <p className="text-[10px] tracking-[0.15em] text-blue-300 font-semibold uppercase">Join Us</p>
                  <h3 className="text-lg font-bold text-white">Reserve your spot now</h3>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                {fieldsLoading ? (
                  <div className="text-center py-12 text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-2 h-5 w-5" />
                    <p className="text-sm">Loading form...</p>
                  </div>
                ) : fields.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">No registration fields configured</div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {fields.map((field: any, index: number) => {
                        const ft = field.field_type;
                        const fieldName = ft.name;
                        const isRequired = field.is_required;
                        
                        // Select Input
                        if (ft.input_type === 'select') {
                          return (
                            <div key={field.id} className={index === fields.length - 1 && fields.length % 2 === 1 ? 'col-span-2' : ''}>
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                                {ft.label} {isRequired && '*'}
                              </label>
                              <select
                                required={isRequired}
                                value={formData[fieldName] || ''}
                                onChange={e => setFormData({...formData, [fieldName]: e.target.value})}
                                className="w-full bg-black border border-white/20 rounded-lg p-2 text-white focus:border-blue-500 outline-none text-sm"
                              >
                                <option value="">Select {ft.label}</option>
                                {ft.options && Array.isArray(ft.options) && ft.options.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          );
                        }
                        
                        // Textarea Input
                        if (ft.input_type === 'textarea') {
                          return (
                            <div key={field.id} className="col-span-2">
                              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                                {ft.label} {isRequired && '*'}
                              </label>
                              <textarea
                                required={isRequired}
                                placeholder={ft.placeholder}
                                value={formData[fieldName] || ''}
                                onChange={e => setFormData({...formData, [fieldName]: e.target.value})}
                                className="w-full bg-black border border-white/20 rounded-lg p-2 text-white focus:border-blue-500 outline-none resize-none text-sm"
                                rows={2}
                              />
                            </div>
                          );
                        }
                        
                        // Standard Input
                        return (
                          <div key={field.id} className={index === fields.length - 1 && fields.length % 2 === 1 ? 'col-span-2' : ''}>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                              {ft.label} {isRequired && '*'}
                            </label>
                            <input
                              required={isRequired}
                              type={ft.input_type}
                              placeholder={ft.placeholder}
                              value={formData[fieldName] || ''}
                              onChange={e => setFormData({...formData, [fieldName]: e.target.value})}
                              className="w-full bg-black border border-white/20 rounded-lg p-2 text-white focus:border-blue-500 outline-none text-sm"
                            />
                          </div>
                        );
                      })}
                    </div>

                    <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition mt-4 text-sm">
                      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'CONFIRM MY SEAT'}
                    </button>
                  </form>
                )}
              </div>
              
              {/* Extra spacing element to FORCE scroll on right side for demo purposes */}
              <div className="h-20" /> 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}