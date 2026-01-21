'use client'
import { useState } from 'react';
import { updateTeam } from '@/lib/api/teams';
import { X, Save, Github, Link as LinkIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function EditTeamModal({ team, isOpen, onClose, onUpdate }: any) {
  const [name, setName] = useState(team.name);
  const [desc, setDesc] = useState(team.description || '');
  const [repo, setRepo] = useState(team.repo_link || '');
  const [demo, setDemo] = useState(team.demo_link || '');
  
  // Tag Logic
  const [tags, setTags] = useState<string[]>(team.tags || []);
  const [currentTag, setCurrentTag] = useState('');

  if (!isOpen) return null;

  const handleAddTag = (e: any) => {
    e.preventDefault(); // prevent form submit
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async () => {
    try {
      await updateTeam(team.id, { 
        name, 
        description: desc,
        repo_link: repo,
        demo_link: demo,
        tags: tags
      });
      toast.success("Team settings updated");
      onUpdate(); 
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-lg p-6 relative shadow-2xl h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
        <h2 className="text-xl font-bold text-white mb-6">Squad Settings</h2>
        
        <div className="space-y-5">
          {/* Basic Info */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Team Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-white/20 rounded p-3 text-white mt-1 focus:border-blue-500 outline-none" />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-black border border-white/20 rounded p-3 text-white mt-1 h-24 resize-none focus:border-blue-500 outline-none" />
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                   <Github className="h-3 w-3" /> Repo Link
                </label>
                <input placeholder="https://github.com/..." value={repo} onChange={e => setRepo(e.target.value)} className="w-full bg-black border border-white/20 rounded p-2 text-white mt-1 text-sm focus:border-blue-500 outline-none" />
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                   <LinkIcon className="h-3 w-3" /> Demo Link
                </label>
                <input placeholder="https://..." value={demo} onChange={e => setDemo(e.target.value)} className="w-full bg-black border border-white/20 rounded p-2 text-white mt-1 text-sm focus:border-blue-500 outline-none" />
             </div>
          </div>

          {/* Tags Section */}
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase">Tech Stack / Tags</label>
             <div className="flex gap-2 mt-1 mb-2">
                <input 
                  value={currentTag} 
                  onChange={e => setCurrentTag(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}
                  placeholder="Type tag & enter (e.g. React)" 
                  className="flex-1 bg-black border border-white/20 rounded p-2 text-white text-sm focus:border-blue-500 outline-none" 
                />
                <button onClick={handleAddTag} className="bg-white/10 hover:bg-white/20 px-3 rounded text-white"><Plus className="h-4 w-4" /></button>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                   <span key={tag} className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-blue-500/20">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-white"><X className="h-3 w-3" /></button>
                   </span>
                ))}
             </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                <Save className="h-4 w-4" /> SAVE CHANGES
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}