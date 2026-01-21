import { Terminal, Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12 text-white">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xl font-bold tracking-tighter text-white">
            <Terminal className="h-6 w-6 text-green-500" />
            <span>CLUB_NEXUS</span>
          </div>
          <p className="mt-2 text-sm text-gray-500 max-w-xs">
            The official digital HQ for student developers. Built to ship code and break things.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-8 text-sm font-bold text-gray-400">
          <Link href="/events" className="hover:text-green-400 transition">EVENTS</Link>
          <Link href="/showcase" className="hover:text-green-400 transition">PROJECTS</Link>
          <Link href="/leaderboard" className="hover:text-green-400 transition">LEADERBOARD</Link>
        </div>

        {/* Socials */}
        <div className="flex gap-4">
          <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
            <Github className="h-5 w-5" />
          </a>
          <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
            <Linkedin className="h-5 w-5" />
          </a>
        </div>

      </div>
      
      <div className="mt-12 text-center text-xs text-gray-600 font-mono">
        © 2026 CLUB_NEXUS SYSTEM // ALL RIGHTS RESERVED
      </div>
    </footer>
  );
}