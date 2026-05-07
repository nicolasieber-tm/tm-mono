import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface PhoneMockupProps {
  isActive?: boolean;
}

export const PhoneMockup = ({ isActive = false }: PhoneMockupProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { damping: 30, stiffness: 200 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { damping: 30, stiffness: 200 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x / rect.width - 0.5);
    mouseY.set(y / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative mx-auto w-[340px] h-[720px] rounded-[3.5rem] p-[3px] bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.2)_inset,0_0_40px_rgba(0,0,0,0.3)] transform-gpu transition-transform duration-700 ease-out"
    >
      
      {/* Outer Titanium Band / Hardware Casing */}
      <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-b from-[#b5b5b5] via-[#8c8c8c] to-[#4a4a4a] z-0" />
      <div className="absolute inset-[1.5px] rounded-[3.4rem] bg-[#1c1c1e] z-0 shadow-[0_0_15px_rgba(0,0,0,0.8)_inset]" />

      {/* Glossy edge highlight for the titanium band */}
      <div className="absolute inset-0 rounded-[3.5rem] border-[1.5px] border-white/30 pointer-events-none z-20" />

      {/* Hardware Buttons - Left (Action, Vol Up, Vol Down) */}
      <div className="absolute top-[130px] -left-[4px] w-[4px] h-[26px] bg-gradient-to-r from-[#666] to-[#888] rounded-l-md shadow-[0_1px_3px_rgba(0,0,0,0.5)] z-[-1]" />
      <div className="absolute top-[180px] -left-[4px] w-[4px] h-[55px] bg-gradient-to-r from-[#666] to-[#888] rounded-l-md shadow-[0_1px_3px_rgba(0,0,0,0.5)] z-[-1]" />
      <div className="absolute top-[250px] -left-[4px] w-[4px] h-[55px] bg-gradient-to-r from-[#666] to-[#888] rounded-l-md shadow-[0_1px_3px_rgba(0,0,0,0.5)] z-[-1]" />
      
      {/* Hardware Button - Right (Power) */}
      <div className="absolute top-[200px] -right-[4px] w-[4px] h-[85px] bg-gradient-to-l from-[#666] to-[#888] rounded-r-md shadow-[0_1px_3px_rgba(0,0,0,0.5)] z-[-1]" />

      {/* Antenna lines */}
      <div className="absolute top-[80px] -left-[1.5px] w-[3px] h-[4px] bg-[#333] z-10" />
      <div className="absolute top-[80px] -right-[1.5px] w-[3px] h-[4px] bg-[#333] z-10" />
      <div className="absolute bottom-[80px] -left-[1.5px] w-[3px] h-[4px] bg-[#333] z-10" />
      <div className="absolute bottom-[80px] -right-[1.5px] w-[3px] h-[4px] bg-[#333] z-10" />

      {/* Inner Screen Bezel */}
      <div className="relative w-full h-full bg-black rounded-[3.4rem] overflow-hidden border-[8px] border-black shadow-[0_0_20px_rgba(0,0,0,0.8)_inset] z-10 box-border">
        
        {/* Apple Dynamic Island */}
        <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[118px] h-[35px] bg-black rounded-full z-40 flex items-center justify-end px-3 shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-white/[0.08]">
            {/* Camera lens reflection */}
            <div className="w-[11px] h-[11px] rounded-full bg-[#0a0a0c] shadow-[0_0_3px_rgba(255,255,255,0.15)_inset,0_0_1px_rgba(255,255,255,0.3)] border border-white/5" />
            <div className="absolute left-3 w-[8px] h-[8px] rounded-full bg-[#111] border border-white/5" />
        </div>

        {/* Screen Content - Crossfading Images */}
        <div className="w-full h-full bg-[#0a0a0c] relative">
          
          {/* Missing Image Fallback UI */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-zinc-900 text-white z-0">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-500 mb-4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <p className="text-lg font-semibold mb-2">Bilder fehlen</p>
            <p className="text-sm text-zinc-400">Bitte <b>app-idle.png</b> und <b>app-active.png</b> in den <code>/public</code> Ordner ziehen.</p>
          </div>

          {/* Idle image – always visible as the base layer */}
          <img
            src="/app-idle.png"
            alt="Auron App Idle"
            className="absolute inset-0 w-full h-full object-cover z-20"
          />

          {/* Active image – fades in on top, idle always stays underneath */}
          <motion.img
            src="/app-active.png"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            alt="Auron App Active"
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover z-[21]"
          />

          {/* Glare / Glass Reflection effect on screen */}
          <div className="absolute inset-0 w-full h-full z-30 pointer-events-none">
            <div className="absolute top-0 -left-[100%] w-[150%] h-[150%] bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent transform rotate-[30deg] translate-y-[-20%] shadow-[0_0_20px_rgba(255,255,255,0.02)]" />
          </div>

          {/* Screen Inner Shadow (Vignette) */}
          <div className="absolute inset-0 shadow-[0_0_40px_rgba(0,0,0,0.6)_inset] pointer-events-none z-30" />
        </div>

      </div>
    </motion.div>
  );
};
