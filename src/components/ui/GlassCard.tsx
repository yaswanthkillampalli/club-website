export default function GlassCard({ children, className = "", onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-white/20 ${className}`}
    >
      {children}
    </div>
  );
}