import React, { useEffect, useMemo, useState } from 'react';

const BOOT_LINES = [
  'PROMPTQUEST OS v2.7 [BUILD 1987-DELTA]',
  'INITIALIZING NEURAL LORE ENGINE...',
  '> CHECKING MEMORY BANKS.......... OK',
  '> LOADING WORLD SEED............. OK',
  '> CALIBRATING GAME MASTER AI..... OK',
  '> SCANNING FOR ANOMALIES......... WARNING: INFINITE LOOP DETECTED',
  '> CONTAINING ANOMALY............. CONTAINED',
  'UPLINK ESTABLISHED. WELCOME, OPERATIVE.',
];

const CORRUPTION = ['░', '▒', '▓'];

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

const corruptTail = (remaining) => {
  if (remaining <= 0) {
    return '';
  }

  return Array.from({ length: Math.min(3, remaining) }, () => CORRUPTION[Math.floor(Math.random() * CORRUPTION.length)]).join('');
};

const BootSequence = ({ onComplete, playBootBeep }) => {
  const [visibleCounts, setVisibleCounts] = useState(() => BOOT_LINES.map(() => 0));
  const [flash, setFlash] = useState(false);
  const [dissolve, setDissolve] = useState(false);

  const lines = useMemo(() => BOOT_LINES, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        const line = lines[lineIndex];
        playBootBeep?.();

        for (let charIndex = 1; charIndex <= line.length; charIndex += 1) {
          if (cancelled) {
            return;
          }

          setVisibleCounts((current) => {
            const next = [...current];
            next[lineIndex] = charIndex;
            return next;
          });

          await wait(12);
        }

        await wait(lineIndex === 0 ? 160 : 110);
      }

      if (cancelled) {
        return;
      }

      setFlash(true);
      await wait(180);
      setDissolve(true);
      await wait(420);
      if (!cancelled) {
        onComplete?.();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [lines, onComplete, playBootBeep]);

  return (
    <div className={`boot-overlay ${flash ? 'boot-overlay--flash' : ''} ${dissolve ? 'boot-overlay--dissolve' : ''}`}>
      <div className="boot-shell">
        <div className="boot-header">PROMPTQUEST OS v2.7</div>
        <div className="boot-subheader">[BUILD 1987-DELTA] INITIAL SYSTEM CHECK</div>
        <div className="boot-log">
          {lines.map((line, index) => {
            const count = visibleCounts[index] || 0;
            const isVisible = count > 0;
            const displayed = count >= line.length ? line : `${line.slice(0, count)}${corruptTail(line.length - count)}`;

            return (
              <div
                key={line}
                className={`boot-line ${isVisible ? 'boot-line--visible' : ''}`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span className="boot-prompt">&gt;</span> {displayed}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BootSequence;
