import React, { useEffect, useState } from 'react';

const GENRES = [
  { id: 'cyberpunk', label: 'CYBERPUNK', icon: '⚡' },
  { id: 'fantasy', label: 'FANTASY', icon: '⚔️' },
  { id: 'horror', label: 'HORROR', icon: '💀' },
  { id: 'scifi', label: 'SCI-FI', icon: '🚀' },
  { id: 'noir', label: 'NOIR', icon: '🕵️' },
  { id: 'postapoc', label: 'POST-APOC', icon: '☢️' },
];

const PLACEHOLDER_PROMPTS = [
  'I am a street samurai in Neo-Osaka, crouching behind a burning police cruiser...',
  'I am the last lighthouse keeper on a drowned world, and something is climbing the stairs...',
  'I am a thief who just opened a sarcophagus that whispered my name...',
  'I am a cosmonaut stranded on a station where the other crew never arrived...',
];

export default function ScenarioScreen({ onStart, playUplinkEstablished, playBootBeep }) {
  const [scenario, setScenario] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [error, setError] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  // Rotate placeholder every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((g) => g !== genreId);
      }
      if (prev.length < 3) {
        return [...prev, genreId];
      }
      return prev;
    });
  };

  const handleSubmit = () => {
    if (scenario.length < 20) {
      setError(true);
      playBootBeep?.();
      // Shake animation handled by CSS class
      setTimeout(() => setError(false), 600);
      return;
    }

    // Compose the full prompt with genres
    const genreLabels = selectedGenres
      .map((id) => GENRES.find((g) => g.id === id)?.label)
      .filter(Boolean);
    const composedPrompt = `${scenario}\n\n${genreLabels.length > 0 ? `[GENRE: ${genreLabels.join(', ')}]` : '[GENRE: UNCLASSIFIED]'}`;

    playUplinkEstablished?.();
    onStart(composedPrompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="scenario-screen relative h-screen w-full overflow-hidden bg-retro-bg text-retro-green">
      {/* Background layer with biome-cyber effect */}
      <div className="biome-cyber absolute inset-0 -z-10" />

      {/* Floating particles */}
      <div className="particle-field absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '2px',
              height: '2px',
              backgroundColor: '#4af626',
              borderRadius: '50%',
              animation: `float-up ${8 + Math.random() * 12}s linear infinite`,
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Left side - Decorative ASCII logo and text */}
      <div className="absolute left-0 top-0 h-full w-1/3 flex items-center justify-center opacity-15 pointer-events-none">
        <pre className="font-terminal text-xs text-retro-green-text whitespace-pre-wrap leading-none select-none">
          {`╔═══════════════════╗
║  PROMPTQUEST     ║
║  INFINITE LORE   ║
║  ENGINE v2.7     ║
╚═══════════════════╝`}
        </pre>
      </div>

      {/* Right side - Input panel */}
      <div className="absolute right-0 top-0 h-full w-[55%] md:w-[45%] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className={`glass-panel w-full max-w-md p-6 sm:p-8 ${error ? 'animate-shake' : ''}`}>
          {/* Title */}
          <div className="mb-6 border-b border-retro-green-dim pb-4">
            <h1 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-retro-green">
              OPERATIVE BRIEFING
            </h1>
            <p className="text-xs sm:text-sm text-retro-green-text mt-2 opacity-75">
              Describe your world. Who are you? Where are you? What brought you here?
            </p>
          </div>

          {/* Textarea */}
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-wider text-retro-green-text mb-2">
              Your Story
            </label>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDER_PROMPTS[currentPlaceholder]}
              className="scenario-textarea w-full h-24 sm:h-28 bg-[rgba(6,8,4,0.6)] border border-retro-green-dim focus:border-retro-green rounded font-terminal text-sm text-retro-green-text placeholder-retro-green-dim p-3 focus:outline-none focus:ring-1 focus:ring-retro-green resize-none"
              style={{
                textShadow: '0 0 8px rgba(74,246,38,0.1)',
              }}
            />
            <div className="text-right text-xs text-retro-green-dim mt-2">
              {scenario.length} characters
            </div>
          </div>

          {/* Genre selection */}
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-wider text-retro-green-text mb-3">
              Genre Tags (1-3)
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {GENRES.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`genre-chip px-3 py-2 text-xs font-terminal rounded border transition-all ${
                    selectedGenres.includes(genre.id)
                      ? 'border-retro-green bg-retro-green text-retro-bg shadow-glow-green'
                      : 'border-retro-green-dim bg-transparent text-retro-green-text hover:border-retro-green'
                  }`}
                >
                  <span className="mr-1">{genre.icon}</span>
                  {genre.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 text-xs text-retro-red bg-[rgba(255,42,42,0.1)] border border-retro-red p-2 rounded animate-pulse">
              &gt; INSUFFICIENT DATA — ELABORATE YOUR SCENARIO (MIN 20 CHARS)
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={scenario.length === 0}
            className="w-full py-3 px-4 bg-transparent border-2 border-retro-green text-retro-green font-display text-sm uppercase tracking-wider rounded hover:bg-retro-green hover:text-retro-bg transition-all disabled:opacity-40 disabled:cursor-not-allowed relative group overflow-hidden"
          >
            {/* Sweep highlight effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-retro-green to-transparent opacity-0 group-hover:opacity-20 -translate-x-full group-hover:translate-x-full transition-all duration-500" />
            <span className="relative">ENGAGE UPLINK ▶</span>
          </button>

          {/* Tip */}
          <p className="text-xs text-retro-green-dim text-center mt-4 opacity-60">
            CTRL+ENTER to submit
          </p>
        </div>
      </div>
    </div>
  );
}
