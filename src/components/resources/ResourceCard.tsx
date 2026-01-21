import { Code, FileText, Link as LinkIcon, Youtube, PenTool } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function ResourceCard({ resource }: { resource: any }) {
  
  const getIcon = () => {
    if (resource.url.includes('youtube')) return <Youtube className="h-5 w-5 text-red-500" />;
    if (resource.url.includes('github')) return <Code className="h-5 w-5 text-white" />;
    if (resource.category === 'academic') return <FileText className="h-5 w-5 text-blue-400" />;
    if (resource.category === 'design') return <PenTool className="h-5 w-5 text-purple-400" />;
    return <LinkIcon className="h-5 w-5 text-green-400" />;
  };

  const categoryColors: any = {
    academic: 'bg-blue-900/30 text-blue-300',
    dev: 'bg-green-900/30 text-green-300',
    design: 'bg-purple-900/30 text-purple-300',
    other: 'bg-gray-800 text-gray-300'
  };

  return (
    <GlassCard className="group flex flex-col justify-between hover:border-yellow-500/50">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${categoryColors[resource.category] || categoryColors.other}`}>
            {resource.category}
          </span>
          {getIcon()}
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition">
          <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}</a>
        </h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-3">{resource.description}</p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags?.map((t: string) => (
            <span key={t} className="text-xs text-gray-500 font-mono">#{t}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <img src={resource.profiles?.avatar_url || 'https://github.com/identicons/user.png'} className="h-6 w-6 rounded-full" />
            <span className="text-xs text-gray-400">@{resource.profiles?.username}</span>
          </div>
          <a href={resource.url} target="_blank" className="text-xs font-bold text-yellow-500 hover:underline flex items-center gap-1">
            OPEN <LinkIcon className="h-3 w-3" />
          </a>
        </div>
      </div>
    </GlassCard>
  );
}