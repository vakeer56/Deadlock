import React from 'react';

const DeadlockHeader = ({ teamA, teamB, status, winner, userTeam, scoreA, scoreB }) => {
    return (
        <header className="cyber-hud-header">
            {/* Team Alpha HUD */}
            <div className={`hud-team-sector alpha-sector ${winner?._id === teamA?._id ? 'victory' : ''}`}>
                <div className="hud-badge alpha-badge">
                    <div className="badge-bg"></div>
                    <span className="badge-label cyber-technical-label">ALPHA</span>
                </div>
                <div className="hud-team-info">
                    <span className="hud-team-name">{teamA?.name || teamA?.teamName || "SYS_ERROR"}</span>
                    <div className="hud-score-display cyber-technical-label">
                        SCORE: <span className="score-value">{scoreA || 0}</span>
                    </div>
                    <div className="hud-data-lines">
                        <div className="line"></div>
                        <div className="line short"></div>
                    </div>
                </div>
            </div>

            {/* Central HUD Core */}
            <div className="hud-center-core">
                <div className="core-frame">
                    <div className="scanner-line"></div>
                    <div className="status-display">
                        {status === 'finished' ? (
                            <span className="status-txt terminal-msg">CONNECTION LOST</span>
                        ) : (
                            <>
                                <span className="status-txt blink cyber-technical-label">SECURE_LINK::UP</span>
                                <div className="team-glory-msg cyber-glitch-text">
                                    {userTeam === 'A' ? "GO ALPHA" : (userTeam === 'B' ? "GO OMEGA" : "COMMENCING")}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Team Omega HUD */}
            <div className={`hud-team-sector omega-sector ${winner?._id === teamB?._id ? 'victory' : ''}`}>
                <div className="hud-team-info right">
                    <span className="hud-team-name">{teamB?.name || teamB?.teamName || "SYS_ERROR"}</span>
                    <div className="hud-score-display cyber-technical-label">
                        SCORE: <span className="score-value">{scoreB || 0}</span>
                    </div>
                    <div className="hud-data-lines">
                        <div className="line"></div>
                        <div className="line short"></div>
                    </div>
                </div>
                <div className="hud-badge omega-badge">
                    <div className="badge-bg"></div>
                    <span className="badge-label cyber-technical-label">OMEGA</span>
                </div>
            </div>
        </header>
    );
};

export default DeadlockHeader;
