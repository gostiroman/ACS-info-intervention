import React, { useEffect, useState, useMemo } from 'react';
import { Stage } from '../types';

interface Props {
  stage: Stage;
}

const ArterySimulation: React.FC<Props> = ({ stage }) => {
  // Visual state derived from stage
  const [plaqueCompression, setPlaqueCompression] = useState(1); // 1 = full size, 0.2 = compressed
  const [clotOpacity, setClotOpacity] = useState(0);
  const [wireProgress, setWireProgress] = useState(0); // 0 to 400
  const [balloonScale, setBalloonScale] = useState(0);
  const [stentExpansion, setStentExpansion] = useState(0); // 0 to 1
  const [flowSpeed, setFlowSpeed] = useState(3); 
  
  // Muscle (Myocardium) state
  const [muscleColor, setMuscleColor] = useState('#fda4af'); // pink-300 default
  const [isMuscleDying, setIsMuscleDying] = useState(false);

  useEffect(() => {
    switch (stage) {
      case Stage.HEALTHY:
        setPlaqueCompression(0); // No plaque
        setClotOpacity(0);
        setWireProgress(0);
        setBalloonScale(0);
        setStentExpansion(0);
        setFlowSpeed(2);
        setMuscleColor('#fda4af');
        setIsMuscleDying(false);
        break;
      case Stage.ATHEROSCLEROSIS:
        setPlaqueCompression(1); // Full plaque
        setClotOpacity(0);
        setWireProgress(0);
        setBalloonScale(0);
        setStentExpansion(0);
        setFlowSpeed(2.5); // Slightly turbulent
        setMuscleColor('#fda4af');
        setIsMuscleDying(false);
        break;
      case Stage.RUPTURE_THROMBOSIS:
        setPlaqueCompression(1);
        setClotOpacity(1);
        setWireProgress(0);
        setBalloonScale(0);
        setStentExpansion(0);
        setFlowSpeed(100); // Stopped
        setMuscleColor('#d8b4fe'); // Ischemic
        setIsMuscleDying(true);
        break;
      case Stage.NECROSIS:
        setPlaqueCompression(1);
        setClotOpacity(1);
        setWireProgress(0);
        setBalloonScale(0);
        setStentExpansion(0);
        setFlowSpeed(100);
        setMuscleColor('#334155'); // Necrotic
        setIsMuscleDying(true);
        break;
      case Stage.GUIDEWIRE:
        setPlaqueCompression(1);
        setClotOpacity(0.8); // Wire pierces clot
        setWireProgress(400);
        setBalloonScale(0);
        setStentExpansion(0);
        setFlowSpeed(100);
        setMuscleColor('#475569');
        setIsMuscleDying(false);
        break;
      case Stage.BALLOON:
        setPlaqueCompression(0.4); // Compressed by balloon
        setClotOpacity(0.2); // Disrupted
        setWireProgress(400);
        setBalloonScale(1);
        setStentExpansion(0.2); // Stent starts to open
        setFlowSpeed(100);
        setMuscleColor('#64748b');
        setIsMuscleDying(false);
        break;
      case Stage.STENT_DEPLOY:
        setPlaqueCompression(0.2); // Fully compressed
        setClotOpacity(0);
        setWireProgress(400);
        setBalloonScale(0); // Balloon withdrawn/deflated (visually we hide it or keep it matched to stent momentarily, here we hide)
        setStentExpansion(1); // Fully expanded
        setFlowSpeed(100); // Flow not fully visible yet till restored
        setMuscleColor('#94a3b8');
        setIsMuscleDying(false);
        break;
      case Stage.RESTORED:
        setPlaqueCompression(0.2); // Stays compressed
        setClotOpacity(0);
        setWireProgress(0); // Wire gone
        setBalloonScale(0);
        setStentExpansion(1);
        setFlowSpeed(2); // Flow returns
        setMuscleColor('#cbd5e1'); // Scar
        setIsMuscleDying(false);
        break;
    }
  }, [stage]);

  // Fixed Random Blood Cells
  // Generate them once. Constrain Y to strictly within Lumen (45px to 155px).
  const bloodCells = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      y: 55 + Math.random() * 90, // Keep away from walls (20-40 and 160-180)
      delay: Math.random() * 2,
      size: 3 + Math.random() * 4,
      speedVar: 0.8 + Math.random() * 0.4
    }));
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[400px] bg-slate-950 rounded-3xl overflow-hidden relative border border-slate-800 shadow-2xl flex flex-col">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="flex-1 relative">
        <svg viewBox="0 0 400 250" className="w-full h-full preserve-3d">
            <defs>
                <pattern id="stentPattern" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                    <path d="M0 6L6 0M-1 1L1 -1M5 7L7 5" stroke="#cbd5e1" strokeWidth="1.5" />
                </pattern>
                <linearGradient id="arteryWall" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#b91c1c" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <clipPath id="lumenClip">
                   <rect x="0" y="40" width="400" height="120" />
                </clipPath>
            </defs>

            {/* --- Layer 1: Myocardium (Background) --- */}
            <path 
                d="M0,180 Q200,185 400,180 L400,250 L0,250 Z" 
                fill={muscleColor}
                className="transition-colors duration-[2000ms] ease-in-out"
            />
            
            {/* --- Layer 2: Blood Flow (Behind Plaque) --- */}
            {/* Render blood only if flow speed is reasonable. If stopped, we might show static cells, but for simplicity hide/freeze */}
            <g clipPath="url(#lumenClip)">
                {bloodCells.map(cell => (
                    <circle 
                        key={cell.id}
                        cx="0" 
                        cy={cell.y} 
                        r={cell.size} 
                        fill="#ef4444" 
                        opacity="0.8"
                        className="animate-flow"
                        style={{ 
                            animationDuration: `${flowSpeed * cell.speedVar}s`, 
                            animationDelay: `-${cell.delay}s`,
                            // Hide cells that would be "inside" the clot during occlusion
                            opacity: (stage === Stage.RUPTURE_THROMBOSIS || stage === Stage.NECROSIS) && (cell.y > 90 && cell.y < 110) ? 0 : 0.8
                        }}
                    />
                ))}
            </g>

            {/* --- Layer 3: Artery Walls --- */}
            {/* Top Wall (0-40) */}
            <rect x="0" y="20" width="400" height="20" fill="url(#arteryWall)" />
            {/* Bottom Wall (160-180) */}
            <rect x="0" y="160" width="400" height="20" fill="url(#arteryWall)" />

            {/* --- Layer 4: Plaque (Atherosclerosis) --- */}
            {/* Top Plaque - anchored to y=40 */}
            <g 
                className="transition-transform duration-1000 ease-in-out" 
                style={{ 
                    transformOrigin: '200px 40px', 
                    transform: `scaleY(${stage === Stage.HEALTHY ? 0 : plaqueCompression})`
                }}
            >
                <path d="M100,40 Q200,100 300,40 Z" fill="#facc15" stroke="#eab308" strokeWidth="1" />
            </g>

            {/* Bottom Plaque - anchored to y=160 */}
            <g 
                className="transition-transform duration-1000 ease-in-out" 
                style={{ 
                    transformOrigin: '200px 160px', 
                    transform: `scaleY(${stage === Stage.HEALTHY ? 0 : plaqueCompression})`
                }}
            >
                <path d="M100,160 Q200,100 300,160 Z" fill="#facc15" stroke="#eab308" strokeWidth="1" />
            </g>

            {/* --- Layer 5: Thrombus (Clot) --- */}
            <g className="transition-opacity duration-500" style={{ opacity: clotOpacity }}>
                <circle cx="200" cy="100" r="28" fill="#7f1d1d" filter="url(#glow)" />
                <circle cx="190" cy="95" r="15" fill="#991b1b" />
                <circle cx="210" cy="105" r="18" fill="#991b1b" />
                <circle cx="200" cy="115" r="12" fill="#7f1d1d" />
                {/* Rupture fissures */}
                <path d="M195,100 L205,100" stroke="#fff" strokeWidth="2" opacity="0.3" />
            </g>

            {/* --- Layer 6: Guide Wire --- */}
            <line 
                x1="-10" y1="100" 
                x2={wireProgress} 
                y2="100" 
                stroke="#e2e8f0" 
                strokeWidth="3" 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ opacity: wireProgress > 0 ? 1 : 0 }}
            />
            {/* Wire Tip */}
            <circle cx={wireProgress} cy="100" r="2" fill="#fff" style={{ opacity: wireProgress > 0 ? 1 : 0 }} className="transition-all duration-1000" />

            {/* --- Layer 7: Balloon --- */}
            <g 
                 className="transition-all duration-1000 ease-in-out origin-center"
                 style={{ 
                     transformBox: 'fill-box',
                     transformOrigin: 'center',
                     transform: `scale(${balloonScale})`,
                     opacity: balloonScale > 0 ? 1 : 0 
                 }}
            >
                {/* Balloon Body */}
                <ellipse cx="200" cy="100" rx="40" ry="35" fill="rgba(255, 255, 255, 0.2)" stroke="#fff" strokeWidth="1.5" />
                {/* Balloon segments */}
                <path d="M170,100 Q200,80 230,100" stroke="#fff" strokeWidth="0.5" fill="none" opacity="0.5" />
                <path d="M170,100 Q200,120 230,100" stroke="#fff" strokeWidth="0.5" fill="none" opacity="0.5" />
            </g>

            {/* --- Layer 8: Stent --- */}
            {/* 
                Stent width is fixed (e.g. 60px), height animates from 10px (crimped) to 70px (expanded).
                Center Y is 100.
                If expanded (stentExpansion = 1), height is approx 70 (enough to press plaque).
                If crimped (stentExpansion = 0), height is 6 (on the wire).
            */}
            <g 
                className="transition-all duration-1000 ease-in-out"
                style={{ opacity: stage === Stage.GUIDEWIRE || stage === Stage.BALLOON || stage === Stage.STENT_DEPLOY || stage === Stage.RESTORED ? 1 : 0 }}
            >
                 <rect 
                    x="170" 
                    y={100 - (3 + (stentExpansion * 32))} 
                    width="60" 
                    height={6 + (stentExpansion * 64)} 
                    fill="url(#stentPattern)" 
                    stroke={stage === Stage.RESTORED ? "#94a3b8" : "#fff"}
                    strokeWidth={stage === Stage.RESTORED ? 0 : 1}
                    rx="2"
                />
                {/* Stent borders for better visibility */}
                <line x1="170" y1={100 - (3 + (stentExpansion * 32))} x2="230" y2={100 - (3 + (stentExpansion * 32))} stroke="#cbd5e1" strokeWidth="2" opacity={stentExpansion} />
                <line x1="170" y1={100 + (3 + (stentExpansion * 32))} x2="230" y2={100 + (3 + (stentExpansion * 32))} stroke="#cbd5e1" strokeWidth="2" opacity={stentExpansion} />
            </g>

        </svg>

        {/* Overlay Labels */}
        <div className="absolute top-2 left-2 text-white/60 text-xs bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
            Просвет сосуда
        </div>
        
        <div className="absolute bottom-2 left-2 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm transition-colors duration-500" style={{ color: stage === Stage.NECROSIS ? '#fff' : '#94a3b8', backgroundColor: stage === Stage.NECROSIS ? 'rgba(255,0,0,0.5)' : 'rgba(0,0,0,0.3)' }}>
            Миокард (Сердечная мышца)
        </div>
      
        {stage === Stage.ATHEROSCLEROSIS && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-sm drop-shadow-md animate-pulse-slow text-center">
                Холестериновая<br/>бляшка
            </div>
        )}
      
        {(stage === Stage.RUPTURE_THROMBOSIS || stage === Stage.NECROSIS) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-red-600/90 px-4 py-2 rounded-lg font-bold text-xl drop-shadow-md shadow-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse z-10">
                ТРОМБОЗ!
            </div>
        )}
        
        {isMuscleDying && (
             <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white font-bold text-sm bg-slate-900/80 px-3 py-1 rounded border border-red-500/50 animate-bounce">
                ГИБЕЛЬ КЛЕТОК
             </div>
        )}
      </div>
    </div>
  );
};

export default ArterySimulation;