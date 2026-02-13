import React from 'react';
import Rope from './Rope';

const TugOfWarArena = ({ tugPosition, maxPull }) => {
    // Safety check
    const safeMax = (maxPull && maxPull > 0) ? maxPull : 4;
    const safeTug = (typeof tugPosition === 'number') ? tugPosition : 0;

    // Calculate offset in vw (viewport width)
    // We move the marker within a safe range (e.g., +/- 40vw from center)
    const offsetVw = (safeTug / safeMax) * 38;

    // Clamp to ensure it doesn't fly off screen
    const clampedOffset = Math.max(-48, Math.min(48, offsetVw));

    return (
        <div className="tug-of-war-arena">
            {/* Target Ticks for 4 positions on each side */}
            <div className="arena-ticks">
                {[-4, -3, -2, -1, 1, 2, 3, 4].map(pos => (
                    <div
                        key={pos}
                        className="arena-tick"
                        style={{ left: `calc(50% + ${(pos / 4) * 38}vw)` }}
                    ></div>
                ))}
            </div>

            <div className="arena-center-line"></div>
            <Rope offsetVw={clampedOffset} />
        </div>
    );
};

export default TugOfWarArena;
