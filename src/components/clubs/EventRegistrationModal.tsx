'use client'
import { useState } from 'react';
import { registerForEvent } from '@/lib/api/clubs';
import { X, Loader2, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function EventRegistrationModal({ event, isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    branch: '',
    year: '',
    github: ''
  });

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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
        
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Ticket className="h-6 w-6" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Event Registration</h2>
                <p className="text-xs text-gray-400">{event.title}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                <input required type="tel" className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Branch</label>
                    <input required placeholder="e.g. CSE" className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                        onChange={e => setFormData({...formData, branch: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Year</label>
                    <select className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                        onChange={e => setFormData({...formData, year: e.target.value})}>
                        <option value="">Select</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">GitHub Profile (Optional)</label>
                <input placeholder="github.com/..." className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    onChange={e => setFormData({...formData, github: e.target.value})} />
            </div>

            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition mt-2">
                {loading ? <Loader2 className="animate-spin" /> : 'CONFIRM REGISTRATION'}
            </button>
        </form>
      </div>
    </div>
  );
}