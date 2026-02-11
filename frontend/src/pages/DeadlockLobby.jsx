import React, { useState, useEffect } from 'react';
import './DeadlockLobby.css';

const DeadlockLobby = ({ onMatchFound }) => {
    const [statusLoading, setStatusLoading] = useState(true);
    const [teamStatus, setTeamStatus] = useState(null);
    const [matchInfo, setMatchInfo] = useState(null);

    useEffect(() => {
        document.title = "Deadlock // Lobby";
        const teamId = localStorage.getItem("teamId");
        if (!teamId) {
            setStatusLoading(false);
            return;
        }

        const pollDeadlockStatus = async () => {
            try {
                // 1. Check Team Status
                const teamRes = await fetch(`http://localhost:5000/api/public/crack-code/team-status/${teamId}`);
                if (teamRes.ok) {
                    const data = await teamRes.json();
                    setTeamStatus(data);

                    // If already promoted, trigger transition (though this shouldn't happen in this lobby)
                    if (data.currentRound === 'crack-the-code') {
                        window.location.href = '/crackTheCode';
                        return;
                    }
                }

                // 2. Check Match Assignment
                const matchRes = await fetch(`http://localhost:5000/api/public/deadlock/match/team/${teamId}`);
                if (matchRes.ok) {
                    const data = await matchRes.json();
                    setMatchInfo(data);
                    setStatusLoading(false);

                    if (data.status === 'ongoing') {
                        onMatchFound(data);
                    }
                } else {
                    setStatusLoading(false);
                }
            } catch (error) {
                console.error("Deadlock Polling Error:", error);
                setStatusLoading(false);
            }
        };

        pollDeadlockStatus();
        const intervalId = setInterval(pollDeadlockStatus, 2000);
        return () => clearInterval(intervalId);
    }, [onMatchFound]);

    if (statusLoading) {
        return (
            <div className="deadlock-lobby-container initializing">
                <div className="cyber-loader">
                    <div className="cyber-glitch" data-text="SYNCING NEURAL LINKS...">SYNCING NEURAL LINKS...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="deadlock-lobby-container">
            <div className="lobby-overlay"></div>
            <div className="lobby-content">
                <header className="lobby-header">
                    <h1 className="cyber-title" data-text="DEADLOCK">DEADLOCK</h1>
                    <div className="lobby-status">
                        <div className="waiting-circle-container">
                            <div className="waiting-circle-outer"></div>
                            <div className="waiting-circle-inner"></div>
                        </div>
                        <span>
                            {matchInfo
                                ? `MATCH FOUND: VS ${matchInfo.opponentName}`
                                : 'WAITING FOR OPFOR ASSIGNMENT...'}
                        </span>
                    </div>
                </header>

                <div className="main-layout">
                    <div className="visual-section">
                        <div className="tug-visualizer-container">
                            <div className="tug-labels">
                                <div className="force-indicator team-a">TEAM ALPHA</div>
                                <div className="force-indicator team-b">TEAM OMEGA</div>
                            </div>
                            <div className="tug-visualizer">
                                <div className="energy-node node-1"></div>
                                <div className="energy-node node-2"></div>
                                <div className="tug-line"></div>
                                <div className="tug-marker" style={{ left: '50%' }}>
                                    <div className="tug-marker-glow"></div>
                                </div>
                            </div>
                        </div>
                        <p className="loading-message">
                            {matchInfo
                                ? 'STABILIZING UPLINK. STAND BY FOR COMBAT.'
                                : 'AWAITING BATTLE GRID INITIALIZATION.'}
                        </p>
                    </div>

                    <div className="directives-section">
                        <div className="directives-card">
                            <div className="card-header">
                                <i className="icon-terminal">{">"}</i>
                                <h2>OPERATIONAL DIRECTIVES</h2>
                            </div>
                            <div className="card-body">
                                <div className="directive-item">
                                    <span className="nb">01</span>
                                    <div className="text">
                                        <strong>SYNC-PULL:</strong> Click in perfect synchronization with your team to maximize kinetic force.
                                    </div>
                                </div>
                                <div className="directive-item">
                                    <span className="nb">02</span>
                                    <div className="text">
                                        <strong>POWER GRIDS:</strong> Monitor the grid for thermal spikes; these grant significant leverage.
                                    </div>
                                </div>
                                <div className="directive-item">
                                    <span className="nb">03</span>
                                    <div className="text">
                                        <strong>RESILIENCE:</strong> Maintain active input even when under heavy pressure to initiate a counter-pull.
                                    </div>
                                </div>
                                <div className="directive-item">
                                    <span className="nb">04</span>
                                    <div className="text">
                                        <strong>NETWORK STABILITY:</strong> Disconnection during a pull will lead to significant force loss.
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <span className="secure-line">ENCRYPTION: QUANTUM-RESISTANT</span>
                                <span className="status-line">PHASE: DEADLOCK</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeadlockLobby;
