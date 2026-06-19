import { useCallback, useEffect, useRef } from 'react';

const useSound = () => {
  const audioContextRef = useRef(null);
  const unlockedRef = useRef(false);
  const processingNodesRef = useRef(null);
  const hpWarningPlayedRef = useRef(false);
  const prevHealthRef = useRef(100);

  const stopProcessingHum = () => {
    const nodes = processingNodesRef.current;
    if (!nodes) {
      return;
    }

    const { oscillator, gain } = nodes;
    gain.gain.cancelScheduledValues(audioContextRef.current?.currentTime || 0);
    gain.gain.setTargetAtTime(0.0001, audioContextRef.current?.currentTime || 0, 0.01);
    oscillator.stop((audioContextRef.current?.currentTime || 0) + 0.05);
    oscillator.disconnect();
    gain.disconnect();
    processingNodesRef.current = null;
  };

  const unlockAudio = useCallback(async () => {
    if (unlockedRef.current) {
      return audioContextRef.current;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch {
        return null;
      }
    }

    unlockedRef.current = true;
    return audioContextRef.current;
  }, []);

  useEffect(() => {
    const handleFirstGesture = () => {
      unlockAudio();
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true, capture: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true, capture: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true, capture: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture, { capture: true });
      window.removeEventListener('keydown', handleFirstGesture, { capture: true });
      window.removeEventListener('touchstart', handleFirstGesture, { capture: true });
      stopProcessingHum();
    };
  }, [unlockAudio]);

  const getAudioContext = useCallback(() => audioContextRef.current, []);

  const createVoice = useCallback((frequency, duration, type = 'sine', gainValue = 0.03, release = 0.04) => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return null;
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(gainValue, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration + release);
    return { oscillator, gainNode, ctx };
  }, [getAudioContext]);

  // V2 SOUND LIBRARY
  // ─────────────────────────────────────────────────────────────

  const playTransmissionStart = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Soft 2-tone: 80Hz → 120Hz sweep, sine, gain 0.04, 300ms
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }, [getAudioContext]);

  const playTransmissionEnd = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // 3-note ascending: C4(262Hz) → E4(330Hz) → G4(392Hz), 60ms each
    const notes = [262, 330, 392];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + index * 0.06);
      gain.gain.setValueAtTime(0.02, ctx.currentTime + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.06 + 0.06);
      osc.start(ctx.currentTime + index * 0.06);
      osc.stop(ctx.currentTime + index * 0.06 + 0.08);
    });
  }, [getAudioContext]);

  const playChoiceHover = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Single 1400Hz sine tone, 30ms, gain 0.02
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, [getAudioContext]);

  const playChoiceSelect = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // G5 (784Hz) → C5 (523Hz) + noise burst
    const notes = [784, 523.25];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + index * 0.08);
      gain.gain.setValueAtTime(0.03, ctx.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.08 + (index === 0 ? 0.08 : 0.12));
      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + (index === 0 ? 0.1 : 0.14));
    });
  }, [getAudioContext]);

  const playItemPickup = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Pentatonic chime: C5 → E5 → G5 → C6, 60ms each
    const notes = [523.25, 659.25, 784, 1046.5];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + index * 0.05);
      gain.gain.setValueAtTime(0.02, ctx.currentTime + index * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.05 + 0.08);
      osc.start(ctx.currentTime + index * 0.05);
      osc.stop(ctx.currentTime + index * 0.05 + 0.1);
    });
  }, [getAudioContext]);

  const playHPWarning = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Only play once when crossing < 30 threshold
    if (hpWarningPlayedRef.current) {
      return;
    }
    hpWarningPlayedRef.current = true;

    // 3 pulsed square waves: 330Hz, 50ms on / 100ms gap
    [0, 0.15, 0.3].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(330, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.04, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.05);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.08);
    });
  }, [getAudioContext]);

  const playHPHeal = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Reset warning flag
    hpWarningPlayedRef.current = false;

    // Ascending sparkle: quick 5-note upward run
    const notes = [523.25, 659.25, 784, 987.77, 1174.66];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + index * 0.04);
      gain.gain.setValueAtTime(0.015, ctx.currentTime + index * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.04 + 0.06);
      osc.start(ctx.currentTime + index * 0.04);
      osc.stop(ctx.currentTime + index * 0.04 + 0.08);
    });
  }, [getAudioContext]);

  const playProcessingHum = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return () => {};
    }

    if (processingNodesRef.current) {
      return stopProcessingHum;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    osc.start(ctx.currentTime);
    processingNodesRef.current = { oscillator: osc, gain };

    return stopProcessingHum;
  }, [getAudioContext]);

  const playDeathSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Multi-oscillator crash: descending frequency sweep + tremolo
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.25);
  }, [getAudioContext]);

  const playBootBeep = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Classic IBM POST beep — 1KHz square, 200ms
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }, [getAudioContext]);

  const playBiomeShift = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Ethereal pad chord: 3 sine waves at root + major 3rd + 5th
    // Using A3 (220Hz), C#4 (277Hz), E4 (330Hz)
    const frequencies = [220, 277, 330];
    frequencies.forEach((frequency) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.85);
    });
  }, [getAudioContext]);

  const playUplinkEstablished = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Dramatic 4-note bass sequence: F2 → G2 → Bb2 → F3
    const notes = [87.31, 98, 116.54, 174.61];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + index * 0.15);
      gain.gain.setValueAtTime(0.04, ctx.currentTime + index * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.15 + 0.15);
      osc.start(ctx.currentTime + index * 0.15);
      osc.stop(ctx.currentTime + index * 0.15 + 0.2);
    });
  }, [getAudioContext]);

  // Legacy/compatibility sounds
  const playKeyClick = useCallback(() => {
    createVoice(800, 0.04, 'square', 0.03, 0.01);
  }, [createVoice]);

  const playConfirmBeep = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    const notes = [523.25, 659.25];
    notes.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + index * 0.08);
      gainNode.gain.setValueAtTime(0.02, ctx.currentTime + index * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.08 + 0.14);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(ctx.currentTime + index * 0.08);
      oscillator.stop(ctx.currentTime + index * 0.08 + 0.16);
    });
  }, [getAudioContext]);

  const playPickupChime = useCallback(() => playItemPickup(), [playItemPickup]);
  const playWarningBeep = useCallback(() => playHPWarning(), [playHPWarning]);

  return {
    unlockAudio,
    playTransmissionStart,
    playTransmissionEnd,
    playChoiceHover,
    playChoiceSelect,
    playItemPickup,
    playHPWarning,
    playHPHeal,
    playProcessingHum,
    playDeathSound,
    playBootBeep,
    playBiomeShift,
    playUplinkEstablished,
    // Legacy
    playKeyClick,
    playConfirmBeep,
    playPickupChime,
    playWarningBeep,
  };
};

export default useSound;
