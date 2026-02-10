import React from 'react';
import Rope from './Rope';

const TugOfWarArena = ({ tugPosition, maxPull }) => {
    // Calculate visual position
    // tugPosition is e.g., -5 to +5
    // we want to translate X. 
    // If maxPull is 10, then range is -10 to 10.
    // Let's say we map -10 -> -45% and +10 -> +45% (keeping 5% padding)

    // Safety check
    const safeMax = (maxPull && maxPull > 0) ? maxPull : 10;
    const safeTug = (typeof tugPosition === 'number') ? tugPosition : 0;

    // If Team A (Left) pulls, tugPosition increases (+1). 
    // We want the rope to move LEFT (Negative X) when Team A pulls.
    // So we invert the tugPosition for visual calculation.
    const percentage = -(safeTug / safeMax) * 45;

    // Clamp
    const clampedPercentage = Math.max(-48, Math.min(48, percentage));

    return (
        <div className="tug-of-war-arena">
            <div className="arena-center-line"></div>
            <Rope offsetPercentage={clampedPercentage} />
        </div>
    );
};

export default TugOfWarArena;
