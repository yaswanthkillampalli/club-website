'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { getResources, Resource } from '@/lib/api/resources';
import { BookOpen, Plus, Box, FileText, Code, PenTool, FolderOpen, Loader2 } from 'lucide-react';

// Imports from our new sub-components
import ResourceCard from '@/components/resources/ResourceCard';
import AddResourceForm from '@/components/resources/AddResourceForm';
import Modal from '@/components/ui/Modal';

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      loadResources('all');
    }
    init();
  }, []);

  const loadResources = async (cat: string) => {
    setLoading(true);
    // Add a tiny delay if you want to prevent flickering, 
    // but usually direct fetch is fine.
    const data = await getResources(cat);
    setResources(data || []); // Ensure it's always an array
    setLoading(false);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    loadResources(cat);
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-yellow-500 flex items-center gap-2">
              <BookOpen className="h-8 w-8" /> KNOWLEDGE_BASE
            </h1>
            <p className="text-gray-400 mt-2">Shared wisdom, notes, and tools.</p>
          </div>
          <button 
            onClick={() => { if(!user) return alert("Login required"); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition"
          >
            <Plus className="h-4 w-4" /> SHARE RESOURCE
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Resources', icon: Box },
            { id: 'academic', label: 'Academic Notes', icon: FileText },
            { id: 'dev', label: 'Dev Tutorials', icon: Code },
            { id: 'design', label: 'Design Assets', icon: PenTool },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition whitespace-nowrap ${
                activeCategory === cat.id 
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' 
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}
            >
              <cat.icon className="h-4 w-4" /> {cat.label}
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        
        {loading ? (
          // LOADING STATE
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-yellow-500" />
            <p>Scanning database...</p>
          </div>
        ) : resources.length === 0 ? (
          // EMPTY STATE (The new part)
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
            <FolderOpen className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Resources Found</h3>
            <p className="text-gray-400 max-w-sm text-center mb-6">
              It looks empty here. Be the legend who contributes the first resource to this category.
            </p>
            <button 
               onClick={() => setIsModalOpen(true)}
               className="text-yellow-500 font-bold hover:underline"
            >
              + Contribute Now
            </button>
          </div>
        ) : (
          // GRID STATE
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal title="Contribute Resource" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <AddResourceForm 
            user={user} 
            onSuccess={() => { setIsModalOpen(false); loadResources(activeCategory); }} 
            onCancel={() => setIsModalOpen(false)} 
          />
        </Modal>

      </div>
    </div>
  );
}