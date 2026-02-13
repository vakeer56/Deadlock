import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatches, terminateSession } from '../api/deadlockAdmin';
import './DeadlockTracker.css';

const DeadlockTracker = () => {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Deadlock // Status Tracker";
        const fetchData = async () => {
            try {
                const data = await getMatches();
                setMatches(data.matches || []);
            } catch (err) {
                console.error("Tracker fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 2000); // Poll every 2 seconds for realtime feel
        return () => clearInterval(interval);
    }, []);

    const handleTerminate = async () => {
        if (!window.confirm("Nuclear Reset will wipe ALL match data and reset all teams. Proceed?")) return;
        try {
            await terminateSession();
            setMatches([]);
            navigate('/admin/deadlock');
        } catch (err) {
            console.error("Reset failed:", err);
            alert("Terminate failed on server");
        }
    };

    if (loading) return (
        <div className="tracker-loading-screen">
            <div className="tech-spinner">
                <div className="spinner-inner"></div>
                <div className="spinner-outer"></div>
            </div>
            <p className="loading-text">INTERCEPTING BATTLE DATA...</p>
        </div>
    );

    return (
        <div className="tracker-root">
            <div className="tracker-scanlines"></div>
            <div className="tracker-grid"></div>

            <header className="tracker-header">
                <div className="header-left">
                    <div className="live-indicator">
                        <span className="live-dot"></span>
                        LIVE FEED
                    </div>
                    <h1>DEADLOCK STATUS TRACKER</h1>
                </div>
                <div className="header-right">
                    <div className="stat-card">
                        <span className="stat-label">ACTIVE NODES:</span>
                        <span className="stat-value">{matches.filter(m => m.status === 'ongoing').length}</span>
                    </div>
                    <button className="tracker-terminate-btn" onClick={handleTerminate}>
                        TERMINATE SESSION
                    </button>
                </div>
            </header>

            <div className="tracker-content">
                <div className="match-list">
                    {matches.length === 0 ? (
                        <div className="no-data">NO ACTIVE SESSIONS FOUND</div>
                    ) : (
                        matches.map(match => (
                            <MatchCard key={match._id} match={match} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const MatchCard = ({ match }) => {
    const { teamA, teamB, tugPosition, maxPull, status, winner, pullHistory = [] } = match;
    const isFinished = status === 'finished';

    const percentage = ((tugPosition + maxPull) / (maxPull * 2)) * 100;

    const isWinnerA = winner?.toString() === teamA?._id?.toString();
    const isWinnerB = winner?.toString() === teamB?._id?.toString();

    const colorA = isFinished ? (isWinnerA ? '#00ff41' : '#ff4757') : (tugPosition < 0 ? '#00ff41' : '#e0e0e0');
    const colorB = isFinished ? (isWinnerB ? '#00ff41' : '#ff4757') : (tugPosition > 0 ? '#00ff41' : '#e0e0e0');

    // Semantic Status
    const getSymmetryStatus = () => {
        if (tugPosition === 0) return "NEUTRAL";
        return tugPosition < 0 ? "ALPHA SHIFT" : "OMEGA SHIFT";
    };

    return (
        <div className={`tracker-match-card ${status}`}>
            {status === 'ongoing' && <div className="match-card-glow"></div>}
            <div className="match-info-top">
                <span className="match-status-pill">{status.toUpperCase()}</span>
                <span className="match-id-hash">#{match._id.slice(-6)}</span>
            </div>

            <div className="match-visual-row">
                {/* Team Alpha Side */}
                <div className={`tracker-team alpha ${isFinished ? (isWinnerA ? 'winner' : 'loser') : 'active'}`}>
                    <div className="team-meta">
                        <span className="team-label">ALPHA</span>
                        {isWinnerA && <span className="crown-icon">👑</span>}
                    </div>
                    <div className="team-name-large" style={{ color: colorA }}>{teamA?.name || '---'}</div>
                    <div className="team-progress-mini">
                        {/* Segments removed for smooth tracking */}
                    </div>
                </div>

                {/* Central Tension Visual */}
                <div className="tracker-match-core">
                    <div className="tension-gauge">
                        <div className="gauge-track">
                            <div className="gauge-center-mark"></div>
                            <div className="gauge-fill alpha" style={{
                                width: `${tugPosition < 0 ? (Math.abs(tugPosition) / maxPull) * 50 : 0}%`,
                                right: '50%',
                                opacity: tugPosition < 0 ? 0.6 + (Math.abs(tugPosition) / maxPull) * 0.4 : 0,
                                filter: `blur(${Math.abs(tugPosition) / maxPull * 4}px)`
                            }}></div>
                            <div className="gauge-fill omega" style={{
                                width: `${tugPosition > 0 ? (Math.abs(tugPosition) / maxPull) * 50 : 0}%`,
                                left: '50%',
                                opacity: tugPosition > 0 ? 0.6 + (Math.abs(tugPosition) / maxPull) * 0.4 : 0,
                                filter: `blur(${Math.abs(tugPosition) / maxPull * 4}px)`
                            }}></div>
                            <div className="gauge-pointer" style={{
                                left: `${percentage}%`,
                                color: isFinished ? '#fff' : (tugPosition === 0 ? '#00f3ff' : (tugPosition < 0 ? '#00ff41' : '#ff2a2a')),
                                backgroundColor: isFinished ? '#fff' : (tugPosition === 0 ? '#00f3ff' : (tugPosition < 0 ? '#00ff41' : '#ff2a2a'))
                            }}></div>
                        </div>
                    </div>
                    {isFinished ? (
                        <div className="lead-tag won">
                            {isWinnerA ? `${teamA?.name || 'ALPHA'} WON` : (isWinnerB ? `${teamB?.name || 'OMEGA'} WON` : 'MATCH FINISHED')}
                        </div>
                    ) : (
                        tugPosition !== 0 ? (
                            <div className={`lead-tag ${tugPosition < 0 ? 'alpha' : 'omega'}`}>
                                {tugPosition < 0 ? `${teamA?.name || 'ALPHA'} LEADING +${Math.abs(tugPosition)}` : `${teamB?.name || 'OMEGA'} LEADING +${tugPosition}`}
                            </div>
                        ) : (
                            <div className="lead-tag neutral">DEADLOCK MAINTAINED</div>
                        )
                    )}
                </div>

                {/* Team Omega Side */}
                <div className={`tracker-team omega ${isFinished ? (isWinnerB ? 'winner' : 'loser') : 'active'}`}>
                    <div className="team-meta">
                        {isWinnerB && <span className="crown-icon">👑</span>}
                        <span className="team-label">OMEGA</span>
                    </div>
                    <div className="team-name-large" style={{ color: colorB }}>{teamB?.name || '---'}</div>
                    <div className="team-progress-mini">
                        {/* Segments removed for smooth tracking */}
                    </div>
                </div>
            </div>

            <div className="match-footer">
                <div className="match-metrics">
                    TUG_POS: <span className="value">{tugPosition}</span>
                </div>
                {!isFinished && (
                    <div className="connection-pulse">
                        <div className="spinner-mini"></div>
                        STREAMING_LITERALS...
                    </div>
                )}
            </div>
        </div >
    );
};

export default DeadlockTracker;
