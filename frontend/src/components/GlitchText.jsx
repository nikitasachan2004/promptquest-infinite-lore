import React from 'react';

const GlitchText = ({ as: Component = 'span', children, className = '' }) => {
  const text = typeof children === 'string' ? children : undefined;

  return (
    <Component
      className={`glitch-text ${className}`.trim()}
      data-text={text}
    >
      {children}
    </Component>
  );
};

export default GlitchText;
