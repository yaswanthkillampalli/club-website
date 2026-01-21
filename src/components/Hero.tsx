'use client'
import { motion } from "framer-motion";
import { ArrowRight, Code, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden bg-black pt-20">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>

      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left: The Text */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              LIVE: Season 2 Hackathon
            </div>
            
            <h1 className="text-5xl font-bold tracking-tighter text-white sm:text-7xl">
              Where Code <br />
              Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Culture.</span>
            </h1>
            
            <p className="mt-6 text-lg text-gray-400 max-w-lg leading-relaxed">
              The elite community for student developers. Compete in high-stakes hackathons, showcase your builds, and climb the global leaderboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login">
                <button className="flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-bold text-black hover:bg-gray-200 transition">
                  START HACKING <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/showcase">
                <button className="rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition">
                  VIEW PROJECTS
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Right: The "Feature Grid" (Visuals) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {/* Box 1 */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-sm">
              <Code className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white">Open Source</h3>
              <p className="text-sm text-gray-500 mt-2">Contribute to real projects and get verified.</p>
            </div>
            
            {/* Box 2 */}
            <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-sm mt-8">
              <Trophy className="h-8 w-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white">Leaderboards</h3>
              <p className="text-sm text-gray-500 mt-2">Earn XP and badges for every commit.</p>
            </div>

            {/* Box 3 */}
            <div className="col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900/50 to-green-900/20 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <Users className="h-8 w-8 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold text-white">Community First</h3>
                  <p className="text-sm text-gray-500 mt-2">Join 500+ developers in Vijayawada.</p>
                </div>
                <div className="text-4xl font-mono font-bold text-white/10">
                  500+
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}