import React, { useEffect, useMemo, useRef } from 'react';
import TypewriterText from './TypewriterText';
import GlitchText from './GlitchText';

const HISTORY_LIMIT = 8;

const AsciiArt = ({ asciiArt }) => {
  const lines = useMemo(() => asciiArt.split('\n').filter((line) => line.trim().length > 0), [asciiArt]);

  if (!lines.length) {
    return null;
  }

  return (
    <pre className="ascii-art-block">
      {lines.map((line, index) => (
        <div
          key={`${line}-${index}`}
          className="ascii-art-line animate-scan-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {line}
        </div>
      ))}
    </pre>
  );
};

const TerminalLog = ({
  history,
  isTyping,
  health,
  isGameOver,
  gameOverReason,
  onStoryComplete,
  onReboot,
  sound,
}) => {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const visibleHistory = history.slice(-HISTORY_LIMIT);
  const latestEntry = visibleHistory[visibleHistory.length - 1];
  
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }, [visibleHistory.length, isTyping, latestEntry?.story_text]);

  // Auto-scroll to bottom after typing completes
  useEffect(() => {
    if (!isTyping && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isTyping, latestEntry?.story_text]);

  return (
    <div
      ref={scrollRef}
      className="terminal-log flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
    >
      <div className="space-y-6 pb-24">
        {visibleHistory.map((entry, index) => {
          const isLatest = index === visibleHistory.length - 1;
          const opacityClass = index < visibleHistory.length - 1 ? 'opacity-35' : 'opacity-100';

          return (
            <section key={`${entry.room_title}-${entry.id || index}`} className={`${opacityClass} space-y-3`}>
              <div className="terminal-frame">
                <GlitchText as="h2" className="room-title">
                  ╔══[ SECTOR: {entry.room_title} ]══╗
                </GlitchText>
              </div>

              {entry.ascii_art ? <AsciiArt asciiArt={entry.ascii_art} /> : null}

              <div className="story-block">
                {isLatest ? (
                  <TypewriterText
                    text={entry.story_text}
                    onComplete={onStoryComplete}
                    playTransmissionStart={sound?.playTransmissionStart}
                    playTransmissionEnd={sound?.playTransmissionEnd}
                    className="story-text"
                  />
                ) : (
                  <p className="story-text whitespace-pre-wrap">{entry.story_text}</p>
                )}
              </div>
            </section>
          );
        })}

        {isGameOver ? (
          <div className="game-over-shell">
            <div className="game-over-panel">
              <GlitchText as="div" className="game-over-title">
                SYSTEM TERMINATED
              </GlitchText>
              <p className="game-over-reason">{gameOverReason || 'THE MAINFRAME HAS COLLAPSED.'}</p>
              <button type="button" className="reboot-button" onClick={onReboot}>
                [REBOOT SYSTEM]
              </button>
            </div>
            <div className="game-over-overlay" style={{ backgroundColor: 'rgba(255, 0, 0, 0.15)' }} />
          </div>
        ) : null}

        {/* Auto-scroll reference point */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
};

export default TerminalLog;