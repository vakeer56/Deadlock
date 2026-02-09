import React, { useState } from 'react';
import './CrackCodeAdmin.css';

const CrackCodeAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [eligibleCount, setEligibleCount] = useState(0);

    React.useEffect(() => {
        document.title = "Crack Code // Admin";
        const fetchEligible = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/public/crack-code/eligible-teams');
                const data = await response.json();
                setEligibleCount(data.count || 0);
            } catch (e) {
                console.error("Failed to fetch eligible teams", e);
            }
        };
        fetchEligible();
        const interval = setInterval(fetchEligible, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleStartSession = async () => {
        setLoading(true);
        setStatus({ type: 'info', message: 'INJECTING SESSION DATA...' });

        try {
            const response = await fetch('http://localhost:5000/api/admin/crack-code/start', {
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
            const response = await fetch('http://localhost:5000/api/admin/crack-code/reset', {
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
                            <span className={`value ${loading ? 'active' : (eligibleCount > 0 ? 'idle' : 'error')}`}>
                                {loading ? 'PROCESSING...' : (eligibleCount > 0 ? 'STANDBY' : 'NO TEAMS')}
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
                            className={`deploy-button ${loading ? 'loading' : ''}`}
                            onClick={handleStartSession}
                            disabled={loading}
                        >
                            <span className="btn-glitch-bg"></span>
                            <span className="btn-text">{loading ? 'BOOTING...' : 'START SESSION'}</span>
                        </button>

                        <button
                            className="reset-button"
                            onClick={handleResetSession}
                            disabled={loading}
                        >
                            RESET SYSTEMS
                        </button>
                    </div>

                    {status && (
                        <div className={`status-terminal ${status.type}`}>
                            <div className="terminal-header">COMM_LOG.TXT</div>
                            <div className="terminal-body">
                                <span className="terminal-prompt">{">"}</span> {status.message}
                            </div>
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
