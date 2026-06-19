import React, { useEffect, useState } from 'react';

const ControlPanel = ({ choices = [], onSelect, isLoading, isTyping, onSkipTyping, playChoiceHover, playChoiceSelect, playProcessingHum }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    const stop = playProcessingHum?.();
    return () => stop?.();
  }, [isLoading, playProcessingHum]);

  // Track elapsed time during loading
  useEffect(() => {
    if (!isLoading) {
      setElapsed(0);
      return undefined;
    }

    const timer = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading]);

  const disabled = isLoading || isTyping;

  return (
    <section className="control-panel border-t border-[color:var(--retro-green-dim)] bg-[rgba(4,10,4,0.96)] px-4 py-4 sm:px-6 sm:py-5">
      {isLoading ? (
        <div className="space-y-4">
          <div className="uplink-status">&gt; PROCESSING UPLINK<span className="uplink-dots" /></div>
          <div className="uplink-track">
            <div className="uplink-bar" />
          </div>
          <div className="loading-timer" style={{ color: 'rgba(74,246,38,0.4)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            {elapsed}s — AI GAME MASTER COMPUTING YOUR FATE
          </div>
        </div>
      ) : null}

      {isTyping ? (
        <div className="space-y-3 mb-4">
          <button
            type="button"
            onClick={() => onSkipTyping?.()}
            className="skip-btn"
            style={{
              background: 'transparent',
              border: '1px solid rgba(74,246,38,0.3)',
              color: 'rgba(74,246,38,0.5)',
              fontSize: '0.75rem',
              padding: '6px 12px',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              fontFamily: 'monospace',
              width: '100%',
              textTransform: 'uppercase',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(74,246,38,0.6)';
              e.target.style.color = 'rgba(74,246,38,0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(74,246,38,0.3)';
              e.target.style.color = 'rgba(74,246,38,0.5)';
            }}
          >
            [ PRESS TO SKIP ]
          </button>
        </div>
      ) : null}

      <div className={`grid gap-3 ${isLoading ? 'pointer-events-none opacity-40' : 'sm:grid-cols-3'}`}>
        {(!isLoading && !isTyping) && choices.slice(0, 3).map((choice, index) => (
          <button
            key={`${choice}-${index}`}
            type="button"
            disabled={disabled}
            onMouseEnter={() => playChoiceHover?.()}
            onFocus={() => playChoiceHover?.()}
            onClick={() => {
              playChoiceSelect?.();
              onSelect?.(choice);
            }}
            className="choice-button"
          >
            <span className="choice-prefix">[{String.fromCharCode(65 + index)}]</span> {choice}
          </button>
        ))}

        {!isLoading && isTyping ? (
          <div className="text-sm uppercase tracking-[0.25em] text-[color:var(--retro-green-dim)]">&gt; awaiting transcript completion...</div>
        ) : null}

        {!isLoading && !isTyping && choices.length === 0 ? (
          <div className="text-sm uppercase tracking-[0.25em] text-[color:var(--retro-green-dim)]">&gt; awaiting uplink...</div>
        ) : null}
      </div>
    </section>
  );
};

export default ControlPanel;