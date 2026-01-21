'use client'
import { useState, useEffect } from 'react';
import { getTeamMembers, kickMember, deleteTeam } from '@/lib/api/teams';
import { Users, LogOut, Crown, UserPlus, Settings, Trash2, Github, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner'; // Don't forget this!

import ProfileModal from './ProfileModal';
import InviteModal from './InviteModal';
import EditTeamModal from './EditTeamModal';
import ConfirmModal from '@/components/ui/ConfirmModal'; // Import the new modal

export default function TeamDashboard({ team, user, onLeave }: { team: any, user: any, onLeave: () => void }) {
    const [members, setMembers] = useState<any[]>([]);
    
    // Modal States
    const [showInvite, setShowInvite] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    
    // Kick Logic States
    const [memberToKick, setMemberToKick] = useState<{ id: string, name: string } | null>(null);
    const [kickLoading, setKickLoading] = useState(false);

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [selectedMember, setSelectedMember] = useState<any>(null);

    const isCaptain = user.id === team.captain_id;

    const loadMembers = async () => {
        const data = await getTeamMembers(team.id);
        setMembers(data);
    };

    useEffect(() => {
        loadMembers();
    }, [team]);

    // 1. Open the modal (don't kick yet)
    const initiateKick = (userId: string, userName: string) => {
        setMemberToKick({ id: userId, name: userName });
    };

    // 2. Actually perform the kick (called by modal)
    const confirmKick = async () => {
        if (!memberToKick) return;
        
        setKickLoading(true);
        try {
            await kickMember(team.id, memberToKick.id);
            toast.success(`${memberToKick.name} has been removed.`);
            
            setMemberToKick(null); // Close modal
            loadMembers(); // Refresh list
        } catch (err: any) {
            toast.error("Failed to kick member: " + err.message);
        } finally {
            setKickLoading(false);
        }
    };

    const currentMemberIds = members.map((m: any) => m.user_id);

    const handleDeleteTeam = async () => {
        setDeleteLoading(true);
        try {
            await deleteTeam(team.id);
            toast.success("Team disbanded successfully.");
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-linear-to-r from-blue-900/40 to-black border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-6 max-w-3xl"> 
                            
                            {/* 1. Text Content */}
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{team.name}</h2>
                                <p className="text-blue-200/80 text-lg leading-relaxed">
                                    {team.description || "No description provided."}
                                </p>
                            </div>

                            {/* 2. Links & Tags Row */}
                            <div className="flex flex-wrap items-center gap-4">
                                
                                {/* Repo Link */}
                                {team.repo_link && (
                                    <a 
                                        href={team.repo_link} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 hover:border-blue-500/50 transition text-sm font-bold text-white group"
                                    >
                                        <Github className="h-4 w-4 text-gray-400 group-hover:text-white transition" />
                                        <span>Source</span>
                                    </a>
                                )}

                                {/* Demo Link */}
                                {team.demo_link && (
                                    <a 
                                        href={team.demo_link} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-500 transition text-sm font-bold text-blue-300"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                        <span>Live Demo</span>
                                    </a>
                                )}

                                {/* Divider (Only show if we have both links and tags) */}
                                {(team.repo_link || team.demo_link) && team.tags?.length > 0 && (
                                    <div className="hidden sm:block w-px h-6 bg-white/20 mx-2"></div>
                                )}

                                {/* Tags */}
                                {team.tags && team.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {team.tags.map((tag: string) => (
                                            <span 
                                                key={tag} 
                                                className="px-3 py-1 rounded-full bg-black/40 text-gray-300 border border-white/10 text-xs font-mono font-medium shadow-sm"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit Button */}
                        {isCaptain && (
                            <button 
                                onClick={() => setShowEdit(true)} 
                                className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 hover:border-white/20 transition group shrink-0 ml-4"
                                title="Team Settings"
                            >
                                <Settings className="h-5 w-5 text-gray-400 group-hover:text-white transition" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* MEMBERS SECTION */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" /> Roster ({members.length})
                    </h3>
                    <div className="flex gap-3">
                        {isCaptain && (
                            <button onClick={() => setShowInvite(true)} className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 transition">
                                <UserPlus className="h-3 w-3" /> INVITE
                            </button>
                        )}
                        {isCaptain ? (
                            // OPTION A: CAPTAIN (Disband)
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1 bg-red-500/10 px-4 py-2 rounded hover:bg-red-500/20 transition border border-red-500/20"
                            >
                                <AlertTriangle className="h-3 w-3" /> DISBAND SQUAD
                            </button>
                        ) : (
                            // OPTION B: MEMBER (Leave)
                            <button 
                                onClick={onLeave}
                                className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-3 py-2 rounded hover:bg-red-500/20 transition"
                            >
                                <LogOut className="h-3 w-3" /> LEAVE
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((m: any) => {
                         const displayName = m.profiles?.full_name || m.profiles?.username || 'Unknown Agent';
                         const isMe = m.user_id === user.id;

                         return (
                            <div key={m.id} onClick={() => setSelectedMember(m.profiles)} className="group flex justify-between items-center p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/20 transition">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400 border border-white/10">
                                        {displayName[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white flex items-center gap-2">
                                            {displayName}
                                            {m.role === 'captain' && <Crown className="h-3 w-3 text-yellow-500" />}
                                            {isMe && <span className="text-[10px] bg-blue-900 text-blue-300 px-1 rounded">YOU</span>}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase">{m.role}</div>
                                    </div>
                                </div>

                                {isCaptain && m.role !== 'captain' && (
                                    <button 
                                        onClick={() => initiateKick(m.user_id, displayName)} // OPEN MODAL
                                        className="opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-500"
                                        title="Kick Member"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                         );
                    })}
                </div>
            </div>

            {/* --- MODALS --- */}
            
            <InviteModal 
                team={team} 
                isOpen={showInvite} 
                onClose={() => setShowInvite(false)} 
                existingMemberIds={currentMemberIds}
            />
            
            <EditTeamModal 
                team={team} 
                isOpen={showEdit} 
                onClose={() => setShowEdit(false)} 
                onUpdate={() => window.location.reload()} 
            />

            {/* The New Confirmation Modal */}
            <ConfirmModal 
                isOpen={!!memberToKick} // Open if a member is selected
                title="Remove Agent?"
                message={`Are you sure you want to remove ${memberToKick?.name} from the squad? This action cannot be undone.`}
                onConfirm={confirmKick}
                onClose={() => setMemberToKick(null)}
                loading={kickLoading}
            />

            <ConfirmModal 
                isOpen={showDeleteConfirm}
                title="Disband Squad?"
                message="WARNING: This will permanently delete the team, remove all members, and cancel pending invites. This action cannot be undone."
                onConfirm={handleDeleteTeam}
                onClose={() => setShowDeleteConfirm(false)}
                loading={deleteLoading}
            />

            <ProfileModal 
                isOpen={!!selectedMember}
                profile={selectedMember}
                onClose={() => setSelectedMember(null)}
            />
        </div>
    );
}