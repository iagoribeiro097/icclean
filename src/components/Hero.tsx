import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Flame, HeartPulse, CheckCircle2, ChevronRight, Sparkles, User, Droplets, Info, HelpCircle } from 'lucide-react';
import { TECHNICIAN_PHOTO } from '../data/services';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  onStartBooking: () => void;
  onExploreServices: () => void;
}

export default function Hero({ onStartBooking, onExploreServices }: HeroProps) {
  // Active Tab for the interactive showcase: 'simulator' or 'specialist'
  const [activeTab, setActiveTab] = useState<'simulator' | 'specialist'>('simulator');

  // General hero layout parallax state
  const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5; // range: -0.5 to 0.5
    const y = (clientY - top) / height - 0.5; // range: -0.5 to 0.5
    setHeroMouse({ x, y });
  };

  const handleHeroMouseLeave = () => {
    setHeroMouse({ x: 0, y: 0 });
  };

  // --- TAB 1: Couch Cleaning SVG Simulator State ---
  const [cleanPercent, setCleanPercent] = useState(50);
  const [isCleaning, setIsCleaning] = useState(false);
  const [bubbles, setBubbles] = useState<{ id: number; cx: number; cy: number; r: number; delay: number }[]>([]);

  // Calculate dynamic X coordinate for the scanner split based on 0-500 viewBox
  const lineX = useMemo(() => {
    return 30 + (cleanPercent / 100) * 440; // couch width maps from X=30 to X=470
  }, [cleanPercent]);

  // Handle pointer tracking on the simulator card
  const handleSimulatorMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setCleanPercent(pct);
    setIsCleaning(true);
  };

  const handleSimulatorMouseLeave = () => {
    setIsCleaning(false);
    // Smoothly spring back to 50% showcase split
    const interval = setInterval(() => {
      setCleanPercent(prev => {
        const diff = 50 - prev;
        if (Math.abs(diff) < 1) {
          clearInterval(interval);
          return 50;
        }
        return prev + diff * 0.15;
      });
    }, 16);
    return () => clearInterval(interval);
  };

  // Generate dynamic rising bubbles when user actively cleans
  useEffect(() => {
    if (isCleaning) {
      const interval = setInterval(() => {
        setBubbles(prev => {
          const newBubble = {
            id: Date.now() + Math.random(),
            cx: lineX + (Math.random() * 30 - 15),
            cy: 160 + (Math.random() * 40 - 20),
            r: Math.random() * 5 + 3,
            delay: Math.random() * 0.5
          };
          return [...prev.slice(-15), newBubble]; // keep last 15 bubbles
        });
      }, 120);
      return () => clearInterval(interval);
    } else {
      setBubbles([]);
    }
  }, [isCleaning, lineX]);

  // --- TAB 2: Image container 3D parallax state ---
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // rotation calculation
    const rX = -((mouseY / height) - 0.5) * 16; // -8deg to 8deg
    const rY = ((mouseX / width) - 0.5) * 16;  // -8deg to 8deg

    setRotateX(rX);
    setRotateY(rY);
    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100
    });
  };

  const handleImageMouseEnter = () => {
    setIsPhotoHovered(true);
  };

  const handleImageMouseLeave = () => {
    setIsPhotoHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  // Memoized background micro-particles to avoid generating on every state change
  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 95}%`,
      left: `${Math.random() * 95}%`,
      size: Math.random() * 4 + 2, // 2px to 6px
      speed: Math.random() * 1.8 + 0.4, // multiplier
      opacity: Math.random() * 0.35 + 0.15,
    }));
  }, []);

  return (
    <section
      id="hero"
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
      className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white py-16 lg:py-24"
    >
      {/* Dynamic Parallax Micro-Particles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-blue-400 rounded-full blur-[0.5px] transition-transform duration-300 ease-out"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              transform: `translate3d(${heroMouse.x * -55 * p.speed}px, ${heroMouse.y * -55 * p.speed}px, 0)`,
            }}
          />
        ))}
      </div>

      {/* Absolute Decorative Background Glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${heroMouse.x * -20}px, ${heroMouse.y * -20}px, 0)`,
        }}
      ></div>
      <div
        className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${heroMouse.x * -15}px, ${heroMouse.y * -15}px, 0)`,
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Text content (7 columns on desktop) */}
          <div
            className="lg:col-span-7 space-y-8 text-left transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${heroMouse.x * 12}px, ${heroMouse.y * 12}px, 0)`,
            }}
          >
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/15 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold tracking-wide">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Líder em Higienização de Estofados
            </div>

            {/* Headline with interactive wave / ripple effect on words */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight select-none">
              {["Sua", "casa"].map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-3 hover:text-blue-400 transition-colors cursor-default"
                  whileHover={{ y: -6, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 350, damping: 10 }}
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                className="inline-block mr-3 bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent cursor-default drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] font-black"
                whileHover={{ y: -8, scale: 1.06, filter: "drop-shadow(0 0 15px rgba(56,189,248,0.75))" }}
                transition={{ type: "spring", stiffness: 350, damping: 8 }}
              >
                mais saudável
              </motion.span>
              {["e", "livre", "de", "impurezas."].map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-3 hover:text-blue-300 transition-colors cursor-default"
                  whileHover={{ y: -6, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 350, damping: 10 }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Eliminamos 99.9% de ácaros, fungos e sujeiras acumuladas de sofás, colchões e bancos de carro com tecnologia avançada de extração úmida. Resgate o bem-estar da sua família hoje mesmo.
            </p>

            {/* Highlights bullet grid with spin on icons and text lift */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: CheckCircle2, text: "Equipamentos Profissionais" },
                { icon: HeartPulse, text: "Eliminação de Alérgenos" },
                { icon: CheckCircle2, text: "Produtos Biodegradáveis" },
                { icon: Flame, text: "Secagem Rápida Segura" },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover="hover"
                    className="flex items-center gap-3 text-slate-200 cursor-default"
                  >
                    <motion.div
                      variants={{
                        hover: { rotate: 360 }
                      }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <IconComponent className="h-5 w-5 text-blue-400 shrink-0" />
                    </motion.div>
                    <motion.span
                      variants={{
                        hover: { y: -2, color: '#f8fafc' }
                      }}
                      className="text-sm font-medium transition-colors"
                    >
                      {item.text}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>

            {/* CTAs with beautiful motion effects */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                onClick={onStartBooking}
                whileHover={{
                  y: -5,
                  boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <span className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-350">
                  Agendar Higienização
                  <ChevronRight className="h-5 w-5" />
                </span>
              </motion.button>

              <motion.button
                onClick={onExploreServices}
                whileHover={{ y: -3, borderColor: '#3b82f6', backgroundColor: 'rgba(30, 41, 59, 0.8)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="px-8 py-4 bg-slate-900 border border-slate-700 text-slate-200 font-bold rounded-2xl transition-all cursor-pointer"
              >
                Conhecer Serviços
              </motion.button>
            </div>

          </div>

          {/* Interactive Showcase Container (5 columns on desktop) */}
          <div
            className="lg:col-span-5 relative mt-8 lg:mt-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${heroMouse.x * 22}px, ${heroMouse.y * 22}px, 0)`,
            }}
          >
            {/* Visual Tabs Navigation */}
            <div className="flex items-center justify-center gap-1.5 mb-4 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-xs mx-auto">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Simulador SVG
                <span className="bg-cyan-500/25 text-cyan-300 text-[8px] px-1 rounded font-black tracking-wide">NEW</span>
              </button>
              <button
                onClick={() => setActiveTab('specialist')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'specialist'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Especialista
              </button>
            </div>

            <div className="relative mx-auto max-w-md lg:max-w-none">
              <AnimatePresence mode="wait">
                
                {/* ==================== TAB 1: INTERACTIVE COUCH SIMULATOR ==================== */}
                {activeTab === 'simulator' && (
                  <motion.div
                    key="simulator"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden group"
                  >
                    {/* Glowing Accent Ring */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl opacity-20 blur-[1px] pointer-events-none" />

                    {/* Instruction text overlay */}
                    <div className="flex items-center justify-between mb-4 select-none">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-cyan-400">Simulação Interativa de Extração</span>
                        <h4 className="text-sm font-black text-slate-100">Arraste para limpar o estofado</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950/50 border border-cyan-800/40 px-2 py-1 rounded-lg">
                          {Math.round(cleanPercent)}% LIMPO
                        </span>
                      </div>
                    </div>

                    {/* Interactive Touch/Mouse Canvas Container */}
                    <div
                      onMouseMove={handleSimulatorMouseMove}
                      onMouseLeave={handleSimulatorMouseLeave}
                      onTouchMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const touch = e.touches[0];
                        const x = touch.clientX - rect.left;
                        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
                        setCleanPercent(pct);
                        setIsCleaning(true);
                      }}
                      onTouchEnd={() => setIsCleaning(false)}
                      className="relative bg-slate-950/80 rounded-2xl border border-slate-850 p-4 cursor-ew-resize overflow-hidden"
                    >
                      {/* SVG Canvas */}
                      <svg viewBox="0 0 500 300" className="w-full h-auto select-none pointer-events-none drop-shadow-2xl">
                        <defs>
                          {/* Gradients for Clean Couch */}
                          <linearGradient id="cleanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0ea5e9" />
                            <stop offset="100%" stopColor="#1e3a8a" />
                          </linearGradient>
                          <linearGradient id="cleanStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#0284c7" />
                          </linearGradient>
                          
                          {/* Gradients for Dirty Couch */}
                          <linearGradient id="dirtyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#475569" />
                            <stop offset="100%" stopColor="#1e293b" />
                          </linearGradient>
                          <linearGradient id="dirtyStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#64748b" />
                            <stop offset="100%" stopColor="#334155" />
                          </linearGradient>

                          {/* Dynamic ClipPath based on the lineX coordinate */}
                          <clipPath id="cleanClip">
                            <rect x="0" y="0" width={lineX} height="300" />
                          </clipPath>
                        </defs>

                        {/* Ambient Glow behind Sofa */}
                        <circle cx="250" cy="150" r="130" fill="#0284c7" opacity="0.1" filter="blur(40px)" />

                        {/* Floor Shadow */}
                        <ellipse cx="250" cy="255" rx="190" ry="12" fill="black" opacity="0.6" filter="blur(6px)" />

                        {/* Sofa Legs */}
                        <g stroke="#5c2d0c" strokeWidth="4" strokeLinecap="round" fill="#361a07">
                          {/* Left Leg */}
                          <path d="M 68 220 L 55 255" />
                          {/* Right Leg */}
                          <path d="M 432 220 L 445 255" />
                          {/* Middle Leg */}
                          <path d="M 250 220 L 250 255" />
                        </g>

                        {/* ==================== 1. DIRTY SOFA (REAR) ==================== */}
                        <g id="dirtySofa">
                          {/* Sofa Backrest */}
                          <rect x="60" y="80" width="380" height="100" rx="20" fill="url(#dirtyGrad)" stroke="url(#dirtyStroke)" strokeWidth="3" />
                          {/* Left Armrest */}
                          <rect x="35" y="120" width="45" height="100" rx="15" fill="url(#dirtyGrad)" stroke="url(#dirtyStroke)" strokeWidth="3" />
                          {/* Right Armrest */}
                          <rect x="420" y="120" width="45" height="100" rx="15" fill="url(#dirtyGrad)" stroke="url(#dirtyStroke)" strokeWidth="3" />
                          {/* Bottom Base */}
                          <rect x="60" y="180" width="380" height="40" rx="8" fill="url(#dirtyGrad)" stroke="url(#dirtyStroke)" strokeWidth="3" />
                          {/* Seat Cushions */}
                          <rect x="75" y="165" width="170" height="30" rx="8" fill="url(#dirtyGrad)" stroke="url(#dirtyStroke)" strokeWidth="2.5" />
                          <rect x="255" y="165" width="170" height="30" rx="8" fill="url(#dirtyGrad)" stroke="url(#dirtyStroke)" strokeWidth="2.5" />
                          
                          {/* Microscopic Dust & Stain Highlights */}
                          <circle cx="120" cy="110" r="3" fill="#854d0e" opacity="0.5" />
                          <circle cx="150" cy="135" r="2.5" fill="#713f12" opacity="0.6" />
                          <circle cx="180" cy="100" r="4" fill="#a16207" opacity="0.3" filter="blur(1px)" />
                          <circle cx="310" cy="120" r="3.5" fill="#854d0e" opacity="0.5" />
                          <circle cx="365" cy="105" r="2" fill="#713f12" opacity="0.6" />
                          <circle cx="210" cy="190" r="3" fill="#854d0e" opacity="0.5" />
                          <circle cx="280" cy="180" r="2.5" fill="#713f12" opacity="0.6" />
                          <circle cx="430" cy="150" r="3" fill="#854d0e" opacity="0.5" />

                          {/* ==================== CUSTOM VECTOR GERMS & ALLERGENS ==================== */}
                          
                          {/* Germ Type A: Green Spiky Virus Microbe (Left/Middle Backrest) */}
                          <g transform="translate(100, 110)" stroke="#84cc16" strokeWidth="0.8" fill="#4d7c0f" opacity="0.85">
                            <line x1="-6" y1="0" x2="6" y2="0" strokeWidth="1" />
                            <line x1="0" y1="-6" x2="0" y2="6" strokeWidth="1" />
                            <line x1="-4" y1="-4" x2="4" y2="4" strokeWidth="1" />
                            <line x1="4" y1="-4" x2="-4" y2="4" strokeWidth="1" />
                            <circle cx="0" cy="0" r="3" fill="#a3e635" stroke="#4d7c0f" strokeWidth="0.8" />
                          </g>

                          {/* Germ Type A: Green Spiky Virus Microbe (Center Backrest) */}
                          <g transform="translate(220, 100)" stroke="#84cc16" strokeWidth="0.8" fill="#4d7c0f" opacity="0.85">
                            <line x1="-8" y1="0" x2="8" y2="0" strokeWidth="1.2" />
                            <line x1="0" y1="-8" x2="0" y2="8" strokeWidth="1.2" />
                            <line x1="-6" y1="-6" x2="6" y2="6" strokeWidth="1.2" />
                            <line x1="6" y1="-6" x2="-6" y2="6" strokeWidth="1.2" />
                            <circle cx="0" cy="0" r="4" fill="#a3e635" stroke="#4d7c0f" strokeWidth="1" />
                          </g>

                          {/* Germ Type A: Green Spiky Virus Microbe (Right Backrest) */}
                          <g transform="translate(340, 110)" stroke="#84cc16" strokeWidth="0.8" fill="#4d7c0f" opacity="0.85">
                            <line x1="-6" y1="0" x2="6" y2="0" strokeWidth="1" />
                            <line x1="0" y1="-6" x2="0" y2="6" strokeWidth="1" />
                            <line x1="-4" y1="-4" x2="4" y2="4" strokeWidth="1" />
                            <line x1="4" y1="-4" x2="-4" y2="4" strokeWidth="1" />
                            <circle cx="0" cy="0" r="3" fill="#a3e635" stroke="#4d7c0f" strokeWidth="0.8" />
                          </g>

                          {/* Germ Type B: Bacillus Bacterium (Yellow/Orange elongated, left-cushion area) */}
                          <g transform="translate(160, 130) rotate(15)" opacity="0.8">
                            <rect x="-6" y="-2" width="12" height="4" rx="2" fill="#eab308" stroke="#a16207" strokeWidth="0.8" />
                            <path d="M -6 0 Q -10 -2 -12 -1" fill="none" stroke="#eab308" strokeWidth="0.6" />
                          </g>

                          {/* Germ Type B: Bacillus Bacterium (Right Cushion) */}
                          <g transform="translate(380, 175) rotate(-25)" opacity="0.8">
                            <rect x="-8" y="-3" width="16" height="6" rx="3" fill="#eab308" stroke="#a16207" strokeWidth="1" />
                            <path d="M -8 0 Q -12 -3 -14 -1" fill="none" stroke="#eab308" strokeWidth="0.8" />
                          </g>

                          {/* Germ Type C: Microscopic Dust Mite / Ácaro (Center Backrest right side) */}
                          <g transform="translate(280, 140)" opacity="0.85">
                            <path d="M -5 -2 L -8 -3 M -5 2 L -8 3 M 5 -2 L 8 -3 M 5 2 L 8 3" stroke="#713f12" strokeWidth="0.8" fill="none" />
                            <ellipse cx="0" cy="0" rx="6" ry="4" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                            <circle cx="2" cy="-1" r="0.6" fill="#ef4444" />
                            <circle cx="2" cy="1" r="0.6" fill="#ef4444" />
                          </g>

                          {/* Germ Type C: Microscopic Dust Mite / Ácaro (Left cushion) */}
                          <g transform="translate(120, 180) rotate(-10)" opacity="0.85">
                            <path d="M -5 -2 L -8 -3 M -5 2 L -8 3 M 5 -2 L 8 -3 M 5 2 L 8 3" stroke="#713f12" strokeWidth="0.8" fill="none" />
                            <ellipse cx="0" cy="0" rx="6" ry="4" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                            <circle cx="2" cy="-1" r="0.6" fill="#ef4444" />
                            <circle cx="2" cy="1" r="0.6" fill="#ef4444" />
                          </g>

                          {/* Germ Type C: Microscopic Dust Mite / Ácaro (Right cushion middle) */}
                          <g transform="translate(300, 180) rotate(15)" opacity="0.85">
                            <path d="M -5 -2 L -8 -3 M -5 2 L -8 3 M 5 -2 L 8 -3 M 5 2 L 8 3" stroke="#713f12" strokeWidth="0.8" fill="none" />
                            <ellipse cx="0" cy="0" rx="6" ry="4" fill="#78350f" stroke="#451a03" strokeWidth="1" />
                            <circle cx="2" cy="-1" r="0.6" fill="#ef4444" />
                            <circle cx="2" cy="1" r="0.6" fill="#ef4444" />
                          </g>

                          {/* Small dirty spore clusters (Reddish/Yellow allergens) */}
                          <circle cx="55" cy="150" r="1.5" fill="#f97316" opacity="0.7" />
                          <circle cx="58" cy="153" r="1" fill="#ef4444" opacity="0.7" />
                          <circle cx="440" cy="160" r="2" fill="#ef4444" opacity="0.8" />
                          <circle cx="200" cy="175" r="1.5" fill="#eab308" opacity="0.8" />
                        </g>

                        {/* ==================== 2. CLEAN SOFA (CLIPPED FOREGROUND) ==================== */}
                        <g id="cleanSofa" clipPath="url(#cleanClip)">
                          {/* Sofa Backrest */}
                          <rect x="60" y="80" width="380" height="100" rx="20" fill="url(#cleanGrad)" stroke="url(#cleanStroke)" strokeWidth="3" filter="drop-shadow(0 0 6px rgba(56,189,248,0.2))" />
                          {/* Left Armrest */}
                          <rect x="35" y="120" width="45" height="100" rx="15" fill="url(#cleanGrad)" stroke="url(#cleanStroke)" strokeWidth="3" />
                          {/* Right Armrest */}
                          <rect x="420" y="120" width="45" height="100" rx="15" fill="url(#cleanGrad)" stroke="url(#cleanStroke)" strokeWidth="3" />
                          {/* Bottom Base */}
                          <rect x="60" y="180" width="380" height="40" rx="8" fill="url(#cleanGrad)" stroke="url(#cleanStroke)" strokeWidth="3" />
                          {/* Seat Cushions */}
                          <rect x="75" y="165" width="170" height="30" rx="8" fill="url(#cleanGrad)" stroke="url(#cleanStroke)" strokeWidth="2.5" />
                          <rect x="255" y="165" width="170" height="30" rx="8" fill="url(#cleanGrad)" stroke="url(#cleanStroke)" strokeWidth="2.5" />

                          {/* Glimmering Clean Sparkles */}
                          {/* Sparkle 1 */}
                          <path d="M 100 90 L 102 94 L 107 95 L 103 98 L 104 103 L 100 100 L 96 103 L 97 98 L 93 95 L 98 94 Z" fill="#38bdf8" opacity="0.9" />
                          {/* Sparkle 2 */}
                          <path d="M 210 120 L 211 123 L 215 124 L 211 126 L 212 130 L 210 128 L 208 130 L 209 126 L 205 124 L 209 123 Z" fill="#22d3ee" opacity="0.95" />
                          {/* Sparkle 3 */}
                          <path d="M 140 185 L 141 188 L 145 189 L 141 191 L 142 195 L 140 193 L 138 195 L 139 191 L 135 189 L 139 188 Z" fill="#e0f2fe" opacity="0.9" />
                          {/* Sparkle 4 */}
                          <path d="M 330 110 L 331 113 L 335 114 L 331 116 L 332 120 L 330 118 L 328 120 L 329 116 L 325 114 L 329 113 Z" fill="#38bdf8" opacity="0.9" />

                          {/* Floating Microbubbles inside clean area */}
                          <circle cx="85" cy="140" r="5" fill="none" stroke="#e0f2fe" strokeWidth="1" opacity="0.5" />
                          <circle cx="195" cy="105" r="7" fill="none" stroke="#e0f2fe" strokeWidth="1" opacity="0.4" />
                          <circle cx="165" cy="155" r="4" fill="none" stroke="#e0f2fe" strokeWidth="1" opacity="0.5" />
                          <circle cx="285" cy="140" r="6" fill="none" stroke="#e0f2fe" strokeWidth="1" opacity="0.5" />
                        </g>

                        {/* ==================== 3. ACTIVE SUCTION & EXTRACTION JET FLUIDS ==================== */}
                        {/* Vertical Laser Nozzle Line */}
                        <line
                          x1={lineX}
                          y1="50"
                          x2={lineX}
                          y2="250"
                          stroke="#06b6d4"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          filter="drop-shadow(0 0 6px rgba(6,182,212,0.9))"
                        />

                        {/* Nozzle center laser core */}
                        <line
                          x1={lineX}
                          y1="60"
                          x2={lineX}
                          y2="240"
                          stroke="#ffffff"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />

                        {/* Moving extractor physical visual element */}
                        <g>
                          <circle cx={lineX} cy="150" r="14" fill="#06b6d4" opacity="0.25" filter="blur(3px)" />
                          <polygon
                            points={`${lineX-10},140 ${lineX+10},140 ${lineX+14},160 ${lineX-14},160`}
                            fill="url(#cleanGrad)"
                            stroke="#38bdf8"
                            strokeWidth="1"
                            opacity="0.85"
                          />
                          <path d={`M ${lineX-8} 160 Q ${lineX} 175 ${lineX+8} 160`} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
                        </g>

                        {/* Dynamic Extraction Bubbles spawning and rising under mouse */}
                        {bubbles.map((b) => (
                          <g key={b.id} className="animate-pulse">
                            <circle
                              cx={b.cx}
                              cy={b.cy}
                              r={b.r}
                              fill="none"
                              stroke="#67e8f9"
                              strokeWidth="0.8"
                              opacity={0.8}
                            />
                            <circle
                              cx={b.cx - b.r/3}
                              cy={b.cy - b.r/3}
                              r={b.r/4}
                              fill="#ffffff"
                              opacity={0.9}
                            />
                          </g>
                        ))}
                      </svg>

                      {/* Sparkles particles container */}
                      {isCleaning && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-12 bg-cyan-400 blur-sm rounded-full animate-ping"
                            style={{ left: `${(lineX/500)*100}%` }}
                          />
                        </div>
                      )}

                      {/* Combate Alérgico Notice Card Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md border border-blue-900/40 rounded-2xl p-3 flex items-center gap-3 select-none pointer-events-none z-10">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                          <HeartPulse className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Combate Alérgico</p>
                          <p className="text-xs text-slate-100 font-medium leading-tight">99.9% de germes, ácaros e fungos eliminados das fibras</p>
                        </div>
                      </div>
                    </div>

                    {/* Cleaning Stats Metrics Indicator */}
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-center select-none">
                      <div className="p-2 bg-slate-950/45 rounded-xl border border-slate-850">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Germes Removidos</p>
                        <p className="text-sm font-black text-emerald-400">99.9%</p>
                      </div>
                      <div className="p-2 bg-slate-950/45 rounded-xl border border-slate-850">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Extração Ativa</p>
                        <p className="text-sm font-black text-cyan-400">Hidro-Jato</p>
                      </div>
                      <div className="p-2 bg-slate-950/45 rounded-xl border border-slate-850">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tecnologia</p>
                        <p className="text-sm font-black text-blue-400">Vapor+Sucção</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ==================== TAB 2: SPECIALIST PHOTO PORTRAIT ==================== */}
                {activeTab === 'specialist' && (
                  <motion.div
                    key="specialist"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {/* Outer decorative glow, intensifies and shifts on mouse move */}
                    <div
                      className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-lg transition-opacity duration-300"
                      style={{
                        opacity: isPhotoHovered ? 0.65 : 0.4,
                        transform: isPhotoHovered 
                          ? `translate3d(${rotateY * -0.5}px, ${rotateX * 0.5}px, 0) scale(1.02)` 
                          : 'none'
                      }}
                    ></div>
                    
                    {/* Main image container with 3D rotation */}
                    <div 
                      onMouseMove={handleImageMouseMove}
                      onMouseEnter={handleImageMouseEnter}
                      onMouseLeave={handleImageMouseLeave}
                      className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
                      style={{
                        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                        transition: isPhotoHovered ? 'transform 0.05s ease-out' : 'transform 0.5s ease-out',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Image shifting oppositely for depth */}
                      <img
                        src={TECHNICIAN_PHOTO}
                        alt="Isaac Varela - Higienizador de Estofados IC CLEAN"
                        className="w-full h-80 object-cover opacity-90 select-none pointer-events-none"
                        style={{
                          transform: `scale(1.06) translate3d(${rotateY * -0.2}px, ${rotateX * 0.2}px, 0)`,
                          transition: isPhotoHovered ? 'transform 0.05s ease-out' : 'transform 0.5s ease-out',
                          objectPosition: 'center 25%',
                        }}
                        referrerPolicy="no-referrer"
                      />

                      {/* Virtual Spotlight Glare following cursor */}
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(circle 180px at ${glare.x}% ${glare.y}%, rgba(56, 189, 248, 0.45), transparent)`,
                          opacity: isPhotoHovered ? 0.7 : 0,
                        }}
                      ></div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
