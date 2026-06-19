import React from 'react';
import BackgroundLayer, { detectBiome } from './BackgroundLayer';
import TerminalLog from './TerminalLog';
import StatPanel from './StatPanel';
import ControlPanel from './ControlPanel';
import ScanlineOverlay from './ScanlineOverlay';

/**
 * GameLayout - Master layout wrapper for the main game screen.
 * Combines BackgroundLayer, TerminalLog, StatPanel, ControlPanel.
 * Handles biome transitions and overall cinematic layout.
 */
export default function GameLayout({
  history,
  gameState,
  health,
  inventory,
  turnCount,
  isLoading,
  isTyping,
  isGameOver,
  onStoryComplete,
  onChoiceSelect,
  onSkipTyping,
  onReboot,
  sound,
}) {
  // Detect biome from current story
  const currentBiome = detectBiome(gameState.room_title, gameState.story_text);

  return (
    <div className="game-layout relative min-h-screen w-full flex flex-col bg-retro-bg text-retro-green">
      {/* Background with biome-specific effects */}
      <BackgroundLayer biome={currentBiome} />

      {/* Scanline overlay */}
      <ScanlineOverlay />

      {/* Top chrome bar - sticky so it stays visible while scrolling */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-retro-green-dim bg-[rgba(4,8,4,0.95)] px-4 py-3 text-xs uppercase tracking-[0.3em] text-retro-white sm:px-6 flex-none">
        <div className="font-pixel text-sm sm:text-base">PROMPTQUEST: INFINITE LORE</div>
        <div className="text-retro-green">HP: {health}</div>
      </header>

      {/* Main content area - flex row on desktop, flex col on mobile */}
      <main className="relative z-10 flex flex-1 flex-col lg:flex-row">
        {/* Left side - Terminal Log & Control Panel */}
        <div className="flex-1 flex flex-col min-h-0 p-3 lg:p-4">
          {/* Terminal Log - scrollable, grows to fill */}
          <div className="flex-1 overflow-y-auto min-h-[250px] mb-4 glass-panel p-4">
            <TerminalLog
              history={history}
              isTyping={isTyping}
              health={health}
              isGameOver={isGameOver}
              gameOverReason={gameState.game_over_reason}
              onStoryComplete={onStoryComplete}
              onReboot={onReboot}
              playKeyClick={sound.playKeyClick}
              playConfirmBeep={sound.playConfirmBeep}
            />
          </div>

          {/* Control Panel - pinned at bottom of main, never scrolls away */}
          {!isGameOver && (
            <div className="flex-none border-t border-retro-green-dim p-4 sm:p-6 bg-[rgba(4,8,4,0.8)]">
              <ControlPanel
                choices={gameState.choices}
                onSelect={onChoiceSelect}
                isLoading={isLoading}
                isTyping={isTyping}
                onSkipTyping={onSkipTyping}
                playChoiceHover={sound.playChoiceHover}
                playChoiceSelect={sound.playChoiceSelect}
                playProcessingHum={sound.playProcessingHum}
              />
            </div>
          )}
        </div>

        {/* Right side - Stat Panel */}
        <aside className="flex-none w-full lg:w-72 
                          lg:sticky lg:top-[52px] lg:self-start
                          lg:max-h-[calc(100vh-52px)] lg:overflow-y-auto
                          p-3 border-t lg:border-t-0 lg:border-l border-retro-green-dim">
          <StatPanel
            health={health}
            inventory={inventory}
            turnCount={turnCount}
            playWarningBeep={sound.playWarningBeep}
            playPickupChime={sound.playPickupChime}
          />
        </aside>
      </main>
    </div>
  );
}
