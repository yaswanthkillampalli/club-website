// This needs to be a Client Component now because of the Modal interaction
'use client' 

import { createClient } from '@/utils/supabase/client';
import ProjectCard from '@/components/ProjectCard';
import SubmitProjectModal from '@/components/SubmitProjectModal'; // Import Modal
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

export default function ShowcasePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2. Get Projects
      const { data } = await supabase
        .from('projects')
        .select('*, profiles(username, avatar_url)') // Join with profile to get author name
        .order('likes_count', { ascending: false });
      
      if (data) setProjects(data);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-24 px-6 text-white">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-purple-500">
              &lt;PROJECT_SHOWCASE /&gt;
            </h1>
            <p className="mt-2 text-gray-400">
              What our members are building. Ship code, get recognized.
            </p>
          </div>
          
          {/* THE BUTTON */}
          <button 
            onClick={() => {
              if (!user) alert("Please login to submit!");
              else setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded bg-white px-6 py-2 text-sm font-bold text-black hover:bg-gray-200 transition"
          >
            <Plus className="h-4 w-4" /> SUBMIT PROJECT
          </button>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            <p>System Empty. Be the first to deploy.</p>
          </div>
        )}

        {/* THE MODAL */}
        <SubmitProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userId={user?.id}
        />

      </div>
    </div>
  );
}