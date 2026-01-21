'use client'
import { Github, ExternalLink, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function ProjectCard({ project }: { project: any }) {
  const [likes, setLikes] = useState(project.likes_count || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const supabase = createClient();

  // Check if current user has already liked this project
  useEffect(() => {
    async function checkLikeStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('project_likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', project.id)
        .single();
      
      if (data) setHasLiked(true);
    }
    checkLikeStatus();
  }, [project.id]);

  const handleToggleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login to vote!");

    // Optimistic UI Update (Update screen instantly before DB finishes)
    const newHasLiked = !hasLiked;
    setHasLiked(newHasLiked);
    setLikes(prev => newHasLiked ? prev + 1 : prev - 1);

    if (newHasLiked) {
      // Add Like
      await supabase.from('project_likes').insert([{ user_id: user.id, project_id: project.id }]);
    } else {
      // Remove Like
      await supabase.from('project_likes').delete().match({ user_id: user.id, project_id: project.id });
    }
  };

  if (!project) return null;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-purple-500/50 hover:bg-white/10">
      
      {/* Author Header */}
      {project.profiles && (
        <div className="mb-4 flex items-center gap-2">
          <img 
            src={project.profiles.avatar_url || "https://github.com/identicons/user.png"} 
            className="h-6 w-6 rounded-full border border-white/10"
          />
          <span className="text-xs font-mono text-gray-400">@{project.profiles.username}</span>
        </div>
      )}

      <div>
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition">
            {project.title}
          </h3>
          <div className="flex gap-2">
            {project.repo_url && (
              <Link href={project.repo_url} target="_blank" className="text-gray-400 hover:text-white transition">
                <Github className="h-5 w-5" />
              </Link>
            )}
            {project.demo_url && (
              <Link href={project.demo_url} target="_blank" className="text-gray-400 hover:text-white transition">
                <ExternalLink className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-400 line-clamp-2">
          {project.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech_tags?.map((tag: string) => (
            <span key={tag} className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-300 border border-purple-500/20">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-4 text-sm text-gray-500">
        
        {/* THE VOTING BUTTON */}
        <button 
          onClick={handleToggleLike}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`flex items-center gap-1.5 transition ${hasLiked ? 'text-red-500' : 'hover:text-red-400'}`}
        >
          <Heart 
            className={`h-4 w-4 transition-all ${hasLiked || isHovered ? 'fill-current scale-110' : ''}`} 
          />
          <span className="font-bold">{likes}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-yellow-500/50" />
          <span>{project.cached_stars || 0}</span>
        </div>
      </div>
    </div>
  );
}