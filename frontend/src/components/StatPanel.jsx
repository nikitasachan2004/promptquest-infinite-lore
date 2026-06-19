import React, { useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const StatPanel = ({ health, inventory = [], turnCount = 0, playWarningBeep, playPickupChime }) => {
  const previousHealthRef = useRef(health);
  const previousInventoryRef = useRef(inventory);
  const [renderedInventory, setRenderedInventory] = useState(inventory);
  const [freshIndexes, setFreshIndexes] = useState([]);

  useEffect(() => {
    const previousHealth = previousHealthRef.current;
    if (previousHealth >= 30 && health < 30) {
      playWarningBeep?.();
    }

    previousHealthRef.current = health;
  }, [health, playWarningBeep]);

  useEffect(() => {
    const previousInventory = previousInventoryRef.current || [];
    const nextInventory = inventory || [];

    if (nextInventory.length > previousInventory.length) {
      const additions = nextInventory.slice(previousInventory.length);
      const additionIndexes = additions.map((_, index) => previousInventory.length + index);
      additions.forEach(() => playPickupChime?.());
      setFreshIndexes(additionIndexes);

      const timeoutId = window.setTimeout(() => {
        setFreshIndexes([]);
      }, 800);

      setRenderedInventory(nextInventory);
      previousInventoryRef.current = nextInventory;
      return () => window.clearTimeout(timeoutId);
    }

    setRenderedInventory(nextInventory);
    setFreshIndexes([]);
    previousInventoryRef.current = nextInventory;
  }, [inventory, playPickupChime]);

  const displayHealth = clamp(health, 0, 100);
  const barColor = displayHealth >= 60 ? 'var(--retro-green)' : displayHealth >= 30 ? 'var(--retro-amber)' : 'var(--retro-red)';
  const lowHealth = displayHealth < 30;

  return (
    <aside className="stat-panel flex w-full flex-col gap-6 border-t border-[color:var(--retro-green-dim)] px-4 py-4 sm:border-t-0 sm:border-l sm:px-5 sm:py-6 lg:w-[30%] lg:min-w-[280px]">
      <section className="stat-card">
        <div className="stat-heading">HP STATUS</div>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color:var(--retro-white)]">
          <span>HP</span>
          <span className={lowHealth ? 'text-[color:var(--retro-red)] animate-pulse-red' : 'text-[color:var(--retro-white)]'}>
            {displayHealth} / 100
          </span>
        </div>
        <div className="hp-track mt-3">
          <div
            className={`hp-fill ${lowHealth ? 'hp-fill--critical' : ''}`}
            style={{ width: `${displayHealth}%`, backgroundColor: barColor }}
          />
        </div>
      </section>

      <section className="stat-card flex-1">
        <div className="stat-heading">INVENTORY</div>
        {renderedInventory.length === 0 ? (
          <p className="text-sm italic text-[color:var(--retro-green-dim)]">&gt; empty</p>
        ) : (
          <ul className="inventory-list space-y-2">
            {renderedInventory.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className={`inventory-item ${freshIndexes.includes(index) ? 'inventory-item--fresh animate-scan-in' : ''}`}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <span className="inventory-prefix">&gt;</span> {item}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="stat-card mt-auto text-[0.72rem] uppercase tracking-[0.22em] text-[color:var(--retro-white)]">
        <div className="grid grid-cols-2 gap-x-2 w-full">
          <span className="text-[color:var(--retro-green-dim)] truncate">UPLINK</span>
          <span className="text-right truncate">ACTIVE</span>
          <span className="text-[color:var(--retro-green-dim)] truncate">AI</span>
          <span className="text-right truncate">ONLINE</span>
          <span className="text-[color:var(--retro-green-dim)] truncate">TURN</span>
          <span className="text-right truncate">{turnCount.toString().padStart(3, '0')}</span>
        </div>
      </section>
    </aside>
  );
};

export default StatPanel;