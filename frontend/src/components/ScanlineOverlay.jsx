import React from 'react';

const ScanlineOverlay = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] scanline-overlay"
    />
  );
};

export default ScanlineOverlay;
