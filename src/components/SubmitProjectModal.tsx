'use client'
import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { X, Github, Terminal, Layers, Link as LinkIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmitProjectModal({ 
  isOpen, 
  onClose, 
  userId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  userId: string;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repo_url: '',
    demo_url: '',
    tech_tags: '' // We will parse this string into an array later
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return alert("You must be logged in!");
    
    setLoading(true);

    // 1. Convert "React, Next.js, AI" -> ["React", "Next.js", "AI"]
    const tagsArray = formData.tech_tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    const { error } = await supabase.from('projects').insert([{
      user_id: userId,
      title: formData.title,
      description: formData.description,
      repo_url: formData.repo_url,
      demo_url: formData.demo_url,
      tech_tags: tagsArray,
      likes_count: 0 // Start with 0 likes
    }]);

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      onClose(); // Close modal
      window.location.reload(); // Refresh to see new project
    }
  };

  const inputStyles = "w-full rounded bg-black/50 border border-white/10 p-3 text-white focus:border-purple-500 outline-none transition font-mono text-sm";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Terminal className="h-5 w-5" />
                <span>DEPLOY_PROJECT</span>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Project Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputStyles} placeholder="ex: AI Task Manager" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputStyles} placeholder="What does it do?" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1">
                    <Github className="h-3 w-3" /> GitHub URL
                  </label>
                  <input required type="url" value={formData.repo_url} onChange={e => setFormData({...formData, repo_url: e.target.value})} className={inputStyles} placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1">
                    <LinkIcon className="h-3 w-3" /> Demo URL (Optional)
                  </label>
                  <input type="url" value={formData.demo_url} onChange={e => setFormData({...formData, demo_url: e.target.value})} className={inputStyles} placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase mb-1">
                  <Layers className="h-3 w-3" /> Tech Stack (Comma separated)
                </label>
                <input 
                  type="text" 
                  value={formData.tech_tags} 
                  onChange={e => setFormData({...formData, tech_tags: e.target.value})} 
                  className={inputStyles} 
                  placeholder="React, Supabase, Tailwind..." 
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full rounded bg-purple-600 py-3 font-bold text-white hover:bg-purple-700 transition flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "SHIP IT 🚀"}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}