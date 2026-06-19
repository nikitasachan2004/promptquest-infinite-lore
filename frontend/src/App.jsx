import React, { useEffect, useMemo, useRef, useState } from 'react';
import BootSequence from './components/BootSequence';
import ScenarioScreen from './components/ScenarioScreen';
import GameLayout from './components/GameLayout';
import useSound from './hooks/useSound';

const INITIAL_STATE = {
  room_title: 'SECTOR ZERO',
  story_text: 'The terminal boots. Static clears. You are here.',
  ascii_art: '',
  choices: ['Look around', 'Check your gear', 'Jack into the network'],
  health: 100,
  inventory: [],
  game_over_reason: '',
  is_game_over: false,
};

const clampHealth = (value) => Math.max(0, Math.min(100, value));

const normalizeState = (responseState, previousState) => {
  const previousHealth = previousState?.health ?? INITIAL_STATE.health;
  const previousInventory = previousState?.inventory ?? [];
  const gameChanges = responseState?.game_changes ?? {};

  let inventory = Array.isArray(responseState?.inventory) ? responseState.inventory : [...previousInventory];

  if (!Array.isArray(responseState?.inventory)) {
    if (Array.isArray(gameChanges.inventory_removed) && gameChanges.inventory_removed.length > 0) {
      inventory = inventory.filter((item) => !gameChanges.inventory_removed.includes(item));
    }

    if (Array.isArray(gameChanges.inventory_added) && gameChanges.inventory_added.length > 0) {
      inventory = [...inventory, ...gameChanges.inventory_added];
    }
  }

  const derivedHealth = typeof responseState?.health === 'number'
    ? responseState.health
    : typeof gameChanges.health_delta === 'number'
      ? previousHealth + gameChanges.health_delta
      : previousHealth;

  const nextHealth = clampHealth(derivedHealth);

  return {
    room_title: responseState?.room_title || previousState?.room_title || INITIAL_STATE.room_title,
    story_text: responseState?.story_text || previousState?.story_text || INITIAL_STATE.story_text,
    ascii_art: responseState?.ascii_art || '',
    choices: Array.isArray(responseState?.options) && responseState.options.length
      ? responseState.options
      : Array.isArray(responseState?.choices) && responseState.choices.length
      ? responseState.choices
      : previousState?.choices || INITIAL_STATE.choices,
    health: nextHealth,
    inventory,
    game_over_reason: responseState?.game_over_reason || '',
    is_game_over: typeof responseState?.is_game_over === 'boolean' ? responseState.is_game_over : nextHealth <= 0,
  };
};

const createHistoryEntry = (state, id) => ({
  id,
  room_title: state.room_title,
  story_text: state.story_text,
  ascii_art: state.ascii_art,
  health: state.health,
});

function App() {
  const sound = useSound();
  
  // 3-screen flow state
  const [showBoot, setShowBoot] = useState(true);
  const [showScenario, setShowScenario] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Game state
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [health, setHealth] = useState(INITIAL_STATE.health);
  const [inventory, setInventory] = useState(INITIAL_STATE.inventory);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState([createHistoryEntry(INITIAL_STATE, 'turn-0')]);
  const [turnCount, setTurnCount] = useState(0);
  const deathPlayedRef = useRef(false);

  const gameOver = useMemo(() => health <= 0 || gameState.is_game_over, [health, gameState.is_game_over]);

  // Handle boot sequence completion
  const handleBootComplete = () => {
    setShowBoot(false);
    setShowScenario(true);
  };

  // Handle scenario submission
  const handleScenarioSubmit = async (scenarioText) => {
    setGameStarted(true);
    setShowScenario(false);
    await callGameAPI(scenarioText, true); // first API call
  };

  // Handle story typing completion
  const handleTypingComplete = () => {
    setIsTyping(false);
  };

  // Handle skip typing button
  const handleSkipTyping = () => {
    setIsTyping(false);
  };

  // Fallback timeout: if typing takes too long, force-unlock choices
  useEffect(() => {
    if (isTyping) {
      const fallback = setTimeout(() => {
        console.warn('Typing timeout - forcing unlock');
        setIsTyping(false);
      }, 25000); // 25 second hard ceiling

      return () => clearTimeout(fallback);
    }
  }, [isTyping]);

  // Reset game - return to scenario screen
  const resetGame = () => {
    setGameState(INITIAL_STATE);
    setHealth(INITIAL_STATE.health);
    setInventory(INITIAL_STATE.inventory);
    setIsLoading(false);
    setIsTyping(false);
    setHistory([createHistoryEntry(INITIAL_STATE, 'turn-0')]);
    setTurnCount(0);
    setGameStarted(false);
    setShowScenario(true);
  };

  // Handle choice selection
  const handleChoiceSelect = async (choice) => {
    if (isLoading || isTyping || gameOver) {
      return;
    }
    await callGameAPI(choice, false);
  };

  // Call game API
  const callGameAPI = async (playerAction, isFirstTurn = false) => {
    setIsLoading(true);
    const stopHum = sound.playProcessingHum();

    try {
      const response = await fetch('http://127.0.0.1:8000/game/turn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previous_state: {
            ...gameState,
            options: gameState.choices,
          },
          player_action: playerAction,
        }),
      });

      if (!response.ok) {
        throw new Error('Server communication failed');
      }

      const responseState = await response.json();
      const normalized = normalizeState(responseState, gameState);
      const nextTurn = turnCount + 1;

      // Check for new inventory items
      const newItems = normalized.inventory.filter((i) => !inventory.includes(i));
      if (newItems.length > 0) {
        sound.playItemPickup?.();
      }

      // Check HP threshold changes
      if (health >= 30 && normalized.health < 30) {
        sound.playHPWarning?.();
      } else if (normalized.health > health) {
        sound.playHPHeal?.();
      }

      setGameState(normalized);
      setHealth(normalized.health);
      setInventory(normalized.inventory);
      setHistory((current) => [...current, createHistoryEntry(normalized, `turn-${nextTurn}`)]);
      setTurnCount(nextTurn);
      setIsTyping(true);
    } catch (error) {
      console.error('Game Error:', error);
      window.alert('Failed to connect to the game engine. Is the backend running?');
    } finally {
      stopHum();
      setIsLoading(false);
    }
  };

  // Handle death sound
  useEffect(() => {
    if (gameOver && !deathPlayedRef.current) {
      deathPlayedRef.current = true;
      sound.playDeathSound?.();
    }

    if (!gameOver) {
      deathPlayedRef.current = false;
    }
  }, [gameOver, sound]);

  // Render 3-screen flow
  return (
    <div
      className="app relative min-h-screen w-full bg-retro-bg text-retro-green"
      onPointerDown={sound.unlockAudio}
      onKeyDown={sound.unlockAudio}
      tabIndex={0}
      role="application"
      aria-label="PromptQuest Infinite Lore"
    >
      {/* Screen 1: Boot Sequence */}
      {showBoot && <BootSequence onComplete={handleBootComplete} playBootBeep={sound.playBootBeep} />}

      {/* Screen 2: Scenario Selection */}
      {showScenario && !gameStarted && (
        <ScenarioScreen
          onStart={handleScenarioSubmit}
          playUplinkEstablished={sound.playUplinkEstablished}
          playBootBeep={sound.playBootBeep}
        />
      )}

      {/* Screen 3: Main Game */}
      {gameStarted && (
        <GameLayout
          history={history}
          gameState={gameState}
          health={health}
          inventory={inventory}
          turnCount={turnCount}
          isLoading={isLoading}
          isTyping={isTyping}
          isGameOver={gameOver}
          onStoryComplete={handleTypingComplete}
          onChoiceSelect={handleChoiceSelect}
          onSkipTyping={handleSkipTyping}
          onReboot={resetGame}
          sound={sound}
        />
      )}
    </div>
  );
}

export default App;