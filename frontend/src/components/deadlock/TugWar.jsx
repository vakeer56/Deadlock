import React from 'react';

const TugWar = ({ tugPosition, maxPull, teamA, teamB }) => {

    const safeMaxPull = maxPull || 5;
    const percentage = Math.min(100, Math.max(0, ((tugPosition + safeMaxPull) / (2 * safeMaxPull)) * 100));

    // Determine visual state
    const isNeutral = tugPosition === 0;
    const isTeamAWinning = tugPosition < 0; // Alpha (Left) wins at negative values
    const isTeamBWinning = tugPosition > 0; // Gamma (Right) wins at positive values

    return (
        <div className="w-full flex flex-col items-center gap-4 mb-8">
            {/* Team Names Header */}
            <div className="flex justify-between w-full uppercase tracking-[0.2em] font-black text-2xl md:text-3xl select-none">
                <div className={`transition-all duration-500 ${isTeamAWinning ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-gray-600'}`}>
                    {teamA?.name || 'TEAM A'}
                </div>
                <div className={`transition-all duration-500 ${isTeamBWinning ? 'text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'text-gray-600'}`}>
                    {teamB?.name || 'TEAM B'}
                </div>
            </div>

            {/* Rope Container */}
            <div className="relative w-full h-12 flex items-center">

                {/* Background Track (The Dark Void) */}
                <div className="absolute inset-0 bg-gray-900 rounded-lg border-2 border-gray-800 shadow-inner overflow-hidden">
                    {/* Grid Pattern overlay */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />

                    {/* Center Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-yellow-500/30 z-0 transform -translate-x-1/2" />

                    {/* Danger Zones */}
                    <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-gradient-to-r from-blue-900/40 to-transparent" />
                    <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-gradient-to-l from-red-900/40 to-transparent" />
                </div>

                {/* The Rope (Connector) */}
                <div className="absolute left-[2%] right-[2%] top-1/2 h-1 bg-gray-700 -translate-y-1/2 rounded-full overflow-hidden">
                    {/* Dynamic tension color */}
                    <div className={`h-full w-full transition-colors duration-500 ${isNeutral ? 'bg-gray-600' : (isTeamAWinning ? 'bg-gradient-to-r from-red-900 to-gray-600' : 'bg-gradient-to-l from-blue-900 to-gray-600')}`} />
                </div>

                {/* The Marker (The Knot) */}
                <div
                    className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)"
                    style={{ left: `${percentage}%` }}
                >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 rounded-full blur-[20px] transition-all duration-500 ${isNeutral ? 'bg-yellow-500/20' : (isTeamAWinning ? 'bg-red-500/40' : 'bg-blue-500/40')}`} />

                    {/* Core Indicator */}
                    <div className={`
                        w-8 h-12 rounded-md border-2 shadow-2xl flex items-center justify-center relative
                        ${isNeutral ? 'bg-gray-800 border-yellow-500 text-yellow-500' :
                            (isTeamAWinning ? 'bg-red-950 border-red-500 text-red-500' : 'bg-blue-950 border-blue-500 text-blue-500')}
                    `}>
                        <div className="w-1 h-6 bg-current rounded-full" />
                    </div>
                </div>
            </div>

            {/* Stats / Meta */}
            <div className="flex justify-between w-full text-xs font-mono text-gray-500 px-1">
                <span>&lt; PULL</span>
                <span className={`${isNeutral ? 'text-gray-600' : (isTeamAWinning ? 'text-red-500' : 'text-blue-500')}`}>
                    DELTA: {Math.abs(tugPosition)}
                </span>
                <span>PULL &gt;</span>
            </div>
        </div>
    );
};

export default TugWar;
