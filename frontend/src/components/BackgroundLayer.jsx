import React, { useEffect } from 'react';

// Biome detection logic
export const detectBiome = (roomTitle = '', storyText = '') => {
  const text = (roomTitle + storyText).toLowerCase();
  if (text.match(/space|orbit|star|void|cosmos|nebula|galaxy/)) return 'biome-space';
  if (text.match(/horror|blood|dead|corpse|terror|shadow|undead|demon|beast/)) return 'biome-horror';
  if (text.match(/dungeon|castle|magic|forest|ancient|ruin|tower|cavern|sacred/)) return 'biome-dungeon';
  if (text.match(/wasteland|desert|ash|decay|dust|ruins|barren|desolate|apocalypse/)) return 'biome-wasteland';
  return 'biome-cyber'; // default
};

/**
 * BackgroundLayer - Renders atmospheric CSS-painted biome backgrounds
 * with animated particles, effects, and transitions.
 */
export default function BackgroundLayer({ biome = 'biome-cyber', animate = true }) {
  return (
    <div className={`background-layer absolute inset-0 -z-20 transition-[background] duration-2000 ${biome}`}>
      {/* Biome-specific animated elements */}
      {biome === 'biome-cyber' && <CyberParticles />}
      {biome === 'biome-dungeon' && <DungeonTorch />}
      {biome === 'biome-wasteland' && <WastelandDust />}
      {biome === 'biome-horror' && <HorrorDrip />}
      {biome === 'biome-space' && <SpaceStars />}
    </div>
  );
}

/**
 * CyberParticles - Floating green dots for cyber biome
 */
function CyberParticles() {
  return (
    <div className="cyber-particles absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="cyber-particle"
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '2px',
            height: '2px',
            backgroundColor: '#4af626',
            borderRadius: '50%',
            boxShadow: '0 0 8px #4af626',
            animation: `float-up ${10 + Math.random() * 15}s linear infinite`,
            opacity: Math.random() * 0.7 + 0.3,
          }}
        />
      ))}
    </div>
  );
}

/**
 * DungeonTorch - Subtle animated "torch flicker" glow at bottom center
 */
function DungeonTorch() {
  return (
    <div className="dungeon-torch absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none">
      <div
        className="animate-pulse"
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, rgba(200,100,0,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}

/**
 * WastelandDust - Animated horizontal "dust sweep" lines
 */
function WastelandDust() {
  return (
    <div className="wasteland-dust absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="dust-line"
          style={{
            position: 'absolute',
            left: 0,
            top: `${(i / 8) * 100}%`,
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(180,100,40,0.1), transparent)',
            animation: `dust-sweep ${4 + i * 0.5}s linear infinite`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}

/**
 * HorrorDrip - Occasional "blood drip" animation on right edge
 */
function HorrorDrip() {
  return (
    <div className="horror-drip absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="drip"
          style={{
            position: 'absolute',
            right: '5%',
            top: `${20 + i * 30}%`,
            width: '2px',
            height: '20px',
            background: 'linear-gradient(180deg, #ff2a2a, transparent)',
            animation: `blood-drip ${3 + i * 1.5}s ease-in infinite`,
            opacity: 0.6,
            delay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * SpaceStars - Twinkling star field via box-shadows
 */
function SpaceStars() {
  const starPositions = React.useMemo(() => {
    return [...Array(200)].map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="space-stars absolute inset-0 pointer-events-none">
      {starPositions.map((star, i) => (
        <div
          key={i}
          className="star animate-blink"
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: '#c8ffc8',
            borderRadius: '50%',
            boxShadow: `0 0 ${star.size * 2}px #c8ffc8`,
            animation: `blink 3s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
