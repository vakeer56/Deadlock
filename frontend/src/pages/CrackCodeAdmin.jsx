import React, { useState } from 'react';
import './CrackCodeAdmin.css';

const CrackCodeAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [eligibleCount, setEligibleCount] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [winnerInfo, setWinnerInfo] = useState(null);

    React.useEffect(() => {
        document.title = "Crack Code // Admin";
        const fetchStatus = async () => {
            try {
                // Check eligible teams
                const eligibleRes = await fetch(`http://${window.location.hostname}:5000/api/public/crack-code/eligible-teams`);
                const eligibleData = await eligibleRes.json();
                setEligibleCount(eligibleData.count || 0);

                // Check global session status
                const statusRes = await fetch(`http://${window.location.hostname}:5000/api/public/crack-code/global-status`);
                const statusData = await statusRes.json();
                setIsSessionActive(statusData.started);

                // Fetch winner info if session is active
                if (statusData.started) {
                    const winnerRes = await fetch(`http://${window.location.hostname}:5000/api/admin/crack-code/winner-info`);
                    const winnerData = await winnerRes.json();
                    if (winnerData.winnerFound) {
                        setWinnerInfo(winnerData);
                    } else {
                        setWinnerInfo(null);
                    }
                } else {
                    setWinnerInfo(null);
                }
            } catch (e) {
                console.error("Failed to fetch status", e);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleStartSession = async () => {
        setLoading(true);
        setStatus({ type: 'info', message: 'INJECTING SESSION DATA...' });

        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/admin/crack-code/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'SESSION BROADCAST SUCCESSFUL. GAME STARTED.' });
            } else {
                setStatus({ type: 'error', message: data.message || 'AUTHORIZATION FAILURE: START REJECTED.' });
            }
        } catch (error) {
            console.error("Admin Start Error:", error);
            setStatus({ type: 'error', message: 'NETWORK INTERRUPT: SYSTEMS OFFLINE.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetSession = async () => {
        if (!window.confirm("CAUTION: This will purge all active sessions. Proceed?")) return;

        setLoading(true);
        setStatus({ type: 'info', message: 'PURGING SESSION DATA...' });

        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/admin/crack-code/reset`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'SYSTEM RESET COMPLETE. ALL SESSIONS PURGED.' });
            } else {
                setStatus({ type: 'error', message: 'RESET PROTOCOL REJECTED.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'NETWORK INTERRUPT: RESET FAILED.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-overlay"></div>
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-label">SYSTEM ADMINISTRATOR</div>
                    <h1 className="admin-title">CRACK ENGINE CONTROL</h1>
                    <div className="admin-subtitle">GATEWAY: CRACK-THE-CODE // SESSION MANAGER</div>
                </header>

                <div className="control-panel">
                    <div className="status-grid">
                        <div className="status-item">
                            <span className="label">ENGINE STATE:</span>
                            <span className={`value ${loading ? 'active' : (isSessionActive ? 'idle' : (eligibleCount > 0 ? 'standby' : 'error'))}`}>
                                {loading ? 'PROCESSING...' : (isSessionActive ? 'SESSION ACTIVE' : (eligibleCount > 0 ? 'READY' : 'NO TEAMS'))}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="label">SESSION STATUS:</span>
                            <span className="value safe">WINNERS_ONLY</span>
                        </div>
                        <div className="status-item">
                            <span className="label">ELIGIBLE TEAMS:</span>
                            <span className="value">{eligibleCount}</span>
                        </div>
                    </div>

                    <div className="main-action">
                        <button
                            className={`deploy-button ${loading ? 'loading' : ''} ${isSessionActive ? 'disabled' : ''}`}
                            onClick={handleStartSession}
                            disabled={loading || isSessionActive}
                        >
                            <span className="btn-glitch-bg"></span>
                            <span className="btn-text">{loading ? 'BOOTING...' : (isSessionActive ? 'SESSION IN PROGRESS' : 'START SESSION')}</span>
                        </button>

                        <button
                            className="reset-button"
                            onClick={handleResetSession}
                            disabled={loading}
                        >
                            RESET SYSTEMS
                        </button>
                    </div>

                    {isSessionActive && (
                        <div className={`live-monitor ${winnerInfo ? 'winner-found' : ''}`}>
                            <div className="monitor-header">
                                <span className={`pulse-dot ${winnerInfo ? 'winner' : ''}`}></span>
                                {winnerInfo && winnerInfo.winner ? 'SESSION_STATE://WINNER_FINALIZED' : 'LIVE_MONITORING://SUBMISSION_STREAM'}
                            </div>

                            {winnerInfo && winnerInfo.winner ? (
                                <div className="winner-display">
                                    <div className="winner-banner">
                                        <div className="banner-glitch" data-text="MISSION ACCOMPLISHED">MISSION ACCOMPLISHED</div>
                                    </div>
                                    <div className="winner-details">
                                        <div className="winner-team-label">CHAMPION_UNIT:</div>
                                        <div className="winner-team-name">{winnerInfo.winner.teamName}</div>
                                        <div className="winner-members">
                                            {winnerInfo.winner.members.map((member, idx) => (
                                                <span key={idx} className="member-tag">{member}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="detection-wrapper">
                                    <div className="scanner-line"></div>
                                    <div className="detecting-text">
                                        DETECTING_WINNER<span className="dots">...</span>
                                    </div>
                                </div>
                            )}

                            {winnerInfo && winnerInfo.allBreaches && winnerInfo.allBreaches.length > 0 && (
                                <div className="breach-tracker">
                                    <div className="tracker-header">SUCCESSFUL_BREACH_LOGS ({winnerInfo.allBreaches.length})</div>
                                    <div className="breach-grid">
                                        {winnerInfo.allBreaches.map((breach) => (
                                            <div key={breach.id} className={`breach-card ${breach.isAbsoluteWinner ? 'winner-card' : ''}`}>
                                                <div className="breach-card-header">
                                                    <span className="timestamp">[{new Date(breach.submittedAt).toLocaleTimeString()}]</span>
                                                    {breach.isAbsoluteWinner && <span className="winner-badge">WINNER</span>}
                                                </div>
                                                <div className="breach-team-name">{breach.teamName}</div>
                                                <div className="breach-members">
                                                    {breach.members.join(", ")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <footer className="admin-footer">
                    <div className="footer-line">ACCESS LEVEL: OVERSIGHT</div>
                    <div className="footer-line">LAST_HEARTBEAT: {new Date().toLocaleTimeString()}</div>
                </footer>
            </div>
        </div>
    );
};

export default CrackCodeAdmin;
