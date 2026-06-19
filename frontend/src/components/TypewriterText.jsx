import React, { useEffect, useState, useRef } from 'react';

const TypewriterText = ({
  text = '',
  onComplete,
  playTransmissionStart,
  playTransmissionEnd,
  className = '',
  speed = 18,
}) => {
  const [visibleText, setVisibleText] = useState('');
  const onCompleteRef = useRef(onComplete);

  // Keep ref in sync with current prop
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    setVisibleText('');

    if (!text) {
      // Immediately call onComplete if text is empty
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
      return undefined;
    }

    const run = async () => {
      // Play transmission start sound once at beginning
      playTransmissionStart?.();

      for (let index = 0; index <= text.length; index += 1) {
        if (cancelled) {
          return;
        }

        setVisibleText(text.slice(0, index));

        await new Promise((resolve) => {
          window.setTimeout(resolve, speed);
        });
      }

      if (cancelled) {
        return;
      }

      // Play transmission end sound when done
      playTransmissionEnd?.();
      
      // CRITICAL: Always call onComplete when typing finishes
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [text, speed, playTransmissionStart, playTransmissionEnd]); // FIXED: removed onComplete from deps

  return (
    <span className={className}>
      {visibleText}
      {visibleText !== text && <span className="cursor-blink">█</span>}
    </span>
  );
};

export default TypewriterText;
