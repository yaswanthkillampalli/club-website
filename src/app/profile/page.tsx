'use client'
import { useState, useEffect } from 'react';
import { getMyProfile, updateProfile } from '@/lib/api/profile';
import { User, Save, Github, Code2, Trophy, Loader2, Link as LinkIcon, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // 1. Load Data
  useEffect(() => {
    async function load() {
      try {
        const data = await getMyProfile();
        if (data) {
          setUser(data);
          setFullName(data.full_name || '');
          setUsername(data.username || '');
          setBio(data.bio || '');
          setGithub(data.github_handle || '');
          setTechStack(data.tech_stack || []);
        }
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 2. Handlers
  const handleAddTag = (e: any) => {
    e.preventDefault();
    if (currentTag && !techStack.includes(currentTag)) {
      setTechStack([...techStack, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTechStack(techStack.filter(t => t !== tag));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        bio,
        github_handle: github,
        tech_stack: techStack
        // Note: We usually don't allow changing 'username' easily as it breaks URLs, 
        // but you can add it if you want.
      });
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Agent Data...</div>;

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white pb-20">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
           <User className="h-8 w-8 text-blue-500" /> AGENT_PROFILE
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: EDIT FORM */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8">
             <div className="flex items-center gap-2 mb-6 text-blue-400">
                <Edit3 className="h-5 w-5" />
                <h2 className="font-bold text-lg">Edit Details</h2>
             </div>

             <div className="space-y-6">
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                        <input 
                          value={fullName} 
                          onChange={e => setFullName(e.target.value)}
                          className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Github Handle</label>
                        <div className="relative">
                            <Github className="absolute left-3 top-3.5 h-4 w-4 text-gray-500" />
                            <input 
                              value={github} 
                              onChange={e => setGithub(e.target.value)}
                              placeholder="username"
                              className="w-full bg-black border border-white/20 rounded-lg p-3 pl-10 text-white focus:border-blue-500 outline-none transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / Mission</label>
                    <textarea 
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition h-32 resize-none"
                        placeholder="What are you building? What are your core skills?"
                    />
                </div>

                {/* Tech Stack */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tech Stack</label>
                    <div className="flex gap-2 mb-3">
                        <input 
                           value={currentTag}
                           onChange={e => setCurrentTag(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}
                           placeholder="Type skill & press Enter (e.g. Next.js)"
                           className="flex-1 bg-black border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                        />
                        <button onClick={handleAddTag} className="bg-white/10 px-4 rounded-lg font-bold hover:bg-white/20">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {techStack.map(tag => (
                            <span key={tag} className="bg-blue-900/30 text-blue-200 border border-blue-500/30 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="hover:text-white">&times;</button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                        SAVE CHANGES
                    </button>
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: PREVIEW CARD */}
          <div className="lg:col-span-1">
             <div className="sticky top-24">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-4">Live Preview</h3>
                 
                 {/* ID CARD UI */}
                 <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group">
                    {/* Header */}
                    <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                    
                    <div className="px-6 pb-6 relative -mt-10">
                        {/* Avatar */}
                        <div className="h-20 w-20 rounded-full bg-black border-4 border-gray-900 flex items-center justify-center overflow-hidden mb-3">
                             {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover"/>
                             ) : (
                                <div className="text-3xl font-bold text-gray-500">{username?.[0]?.toUpperCase()}</div>
                             )}
                        </div>

                        {/* Name & Handle */}
                        <h2 className="text-2xl font-bold text-white leading-tight">
                            {fullName || "Agent Name"}
                        </h2>
                        <div className="flex items-center gap-2 mb-4">
                            <p className="text-blue-400 font-mono text-sm">@{username || "username"}</p>
                            {user?.global_xp > 0 && (
                                <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1">
                                    <Trophy className="h-3 w-3" /> {user.global_xp} XP
                                </span>
                            )}
                        </div>

                        {/* Bio Preview */}
                        <div className="mb-4 text-sm text-gray-300 leading-relaxed">
                            {bio || "No bio information provided yet."}
                        </div>

                        {/* Github Link */}
                        {github && (
                            <a href={`https://github.com/${github}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold mb-4 transition">
                                <Github className="h-4 w-4" /> github.com/{github}
                            </a>
                        )}

                        {/* Tech Stack Preview */}
                        <div className="flex flex-wrap gap-1.5">
                            {techStack.length > 0 ? techStack.map(t => (
                                <span key={t} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300">
                                    {t}
                                </span>
                            )) : (
                                <span className="text-gray-600 text-xs italic">No skills added</span>
                            )}
                        </div>
                    </div>
                 </div>
                 
                 <p className="text-center text-gray-500 text-xs mt-4">This is how you appear in Team Rosters.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}