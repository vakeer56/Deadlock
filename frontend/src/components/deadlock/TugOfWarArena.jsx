import React from 'react';
import Rope from './Rope';

const TugOfWarArena = ({ tugPosition, maxPull }) => {

    // Safety check
    const safeMax = (maxPull && maxPull > 0) ? maxPull : 10;
    const safeTug = (typeof tugPosition === 'number') ? tugPosition : 0;


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
