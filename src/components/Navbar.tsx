'use client'
import Link from 'next/link';
import { Terminal, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Fetch profile avatar
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        setAvatarUrl(data?.avatar_url || "https://github.com/identicons/user.png");
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.refresh();
    router.push('/'); // Go home after logout
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white hover:opacity-80 transition">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-black">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block">1OX DEVS</span>
        </Link>

        {/* Desktop Links */}
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link href="/events" className="hover:text-green-400 transition">EVENTS</Link>
          <Link href="/calendar" className="hover:text-green-400 transition">CALENDAR</Link>
          <Link href="/leaderboard" className="hover:text-green-400 transition">LEADERBOARD</Link>
          <Link href="/resources" className="hover:text-green-400 transition">RESOURCES</Link>
          <Link href="/showcase" className="hover:text-green-400 transition">SHOWCASE</Link>
          <Link href="/teams" className="hover:text-green-400 transition">SQUADS</Link>
          <Link href="/profile" className="hover:text-green-400 transition">PROFILE</Link>
          <Link href="/clubs" className="hover:text-green-400 transition">CLUBS</Link> 
          <Link href="/admin" className="hover:text-green-400 transition">ADMIN</Link>
        </div>

        {/* User Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pr-4 pl-1 py-1 hover:bg-white/10 transition"
              >
                <img 
                  src={avatarUrl || "https://github.com/identicons/user.png"}
                  alt="Profile" 
                  className="h-8 w-8 rounded-full border border-gray-600"
                />
                <span className="text-xs font-bold text-gray-300">ACCOUNT</span>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-neutral-900 p-2 shadow-2xl">
                  <Link href="/profile" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="rounded-full bg-white px-6 py-2 text-xs font-bold text-black hover:bg-gray-200 transition">
              JOIN_NOW
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu (Simplified) */}
      {isOpen && (
        <div className="md:hidden border-b border-white/10 bg-black p-4 space-y-4">
          <Link href="/events" className="block text-gray-300">EVENTS</Link>
          <Link href="/showcase" className="block text-gray-300">SHOWCASE</Link>
          {user ? (
            <>
              <Link href="/profile" className="block text-green-400">MY DASHBOARD</Link>
              <button onClick={handleLogout} className="block text-red-400">SIGN OUT</button>
            </>
          ) : (
            <Link href="/login" className="block text-white font-bold">LOGIN</Link>
          )}
        </div>
      )}
    </nav>
  );
}