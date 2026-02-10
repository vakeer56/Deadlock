import React, { useState, useEffect } from 'react';
import './CrackCodeLobby.css';

const CrackCodeLobby = ({ onGameReady }) => {
    const [gameStatusLoading, setGameStatusLoading] = useState(true);
    const [teamStatus, setTeamStatus] = useState(null);
    const [globalStarted, setGlobalStarted] = useState(false);

    useEffect(() => {
        document.title = "Crack Code // Lobby";
        const teamId = localStorage.getItem("teamId");
        if (!teamId) {
            setGameStatusLoading(false);
            return;
        }

        const pollEverything = async () => {
            try {
                // 1. Fetch Global Status
                const globalRes = await fetch('http://localhost:5000/api/public/crack-code/global-status');
                if (globalRes.ok) {
                    const data = await globalRes.json();
                    setGlobalStarted(data.started);
                }

                // 2. Fetch Team Status
                const teamRes = await fetch(`http://localhost:5000/api/public/crack-code/team-status/${teamId}`);
                if (teamRes.ok) {
                    const data = await teamRes.json();
                    setTeamStatus(data);
                }

                // 3. Check Session Eligibility and Transition
                const sessionRes = await fetch(`http://localhost:5000/api/public/crack-code/session/${teamId}`);
                if (sessionRes.ok) {
                    const data = await sessionRes.json();
                    onGameReady(data);
                } else if (sessionRes.status === 403 || sessionRes.status === 404) {
                    // This team is not starting yet (or never will)
                    setGameStatusLoading(false);
                }
            } catch (error) {
                console.error("Lobby Polling Error:", error);
                setGameStatusLoading(false);
            }
        };

        // Initial check
        pollEverything();

        // Unified interval
        const intervalId = setInterval(pollEverything, 2000);

        return () => clearInterval(intervalId);
    }, [onGameReady]);

    if (gameStatusLoading) {
        return (
            <div className="lobby-container initializing">
                <div className="cyber-loader">
                    <div className="cyber-glitch" data-text="INITIALIZING...">INITIALIZING...</div>
                </div>
            </div>
        );
    }

    const result = teamStatus?.deadlockResult;
    const isWinner = result === 'win' || result === 'winner';
    const isLoser = result === 'lose';
    const isWaiting = !result || result === 'pending';

    return (
        <div className="lobby-container">
            <div className="lobby-overlay"></div>
            <div className="lobby-content">
                <header className="lobby-header">
                    <h1 className="glitch-text" data-text="CRACK THE CODE">CRACK THE CODE</h1>
                    <div className="lobby-status">
                        <div className={`status-indicator ${isWinner ? 'pulse' : 'standby'}`}></div>
                        <span>
                            {isWinner
                                ? 'AUTHENTICATING...'
                                : (globalStarted ? 'SESSION ACTIVE // ACCESS DENIED' : 'WAITING FOR RESULTS...')}
                        </span>
                    </div>
                </header>

                <div className="main-layout">
                    <div className="loader-section">
                        <div className="cyber-core-wrapper">
                            <div className="cyber-core">
                                <div className="core-inner"></div>
                                <div className="ring ring-1"></div>
                                <div className="ring ring-2"></div>
                                <div className="ring ring-3"></div>
                                <div className="scan-line"></div>
                            </div>
                            <div className="data-streams">
                                <div className="stream stream-1">010101</div>
                                <div className="stream stream-2">X-F092</div>
                                <div className="stream stream-3">RECV...</div>
                            </div>
                        </div>
                        <p className="loading-message">
                            {isWinner
                                ? 'CORE STABILIZED. SCANNING FOR COMMANDS.'
                                : (globalStarted
                                    ? 'MISSION COMPLETED. YOU ARE INELIGIBLE FOR CRACK THE CODE.'
                                    : 'AWAITING BLUEPRINT DOMINANCE. FINISH DEADLOCK.')}
                        </p>
                    </div>

                    {(!globalStarted || isWinner) ? (
                        <div className="rules-section">
                            <div className="rules-card">
                                <div className="card-header">
                                    <i className="icon-terminal">{">"}</i>
                                    <h2>MISSION DIRECTIVES</h2>
                                </div>
                                <div className="card-body">
                                    <div className="rule-item">
                                        <span className="rule-nb">01</span>
                                        <div className="rule-text">
                                            <strong>TEAM COHESION:</strong> Work synchronously with your unit to decrypt the logic.
                                        </div>
                                    </div>
                                    <div className="rule-item">
                                        <span className="rule-nb">02</span>
                                        <div className="rule-text">
                                            <strong>LANGUAGE SELECT:</strong> Python, C++, JavaScript, and Java modules are supported.
                                        </div>
                                    </div>
                                    <div className="rule-item">
                                        <span className="rule-nb">03</span>
                                        <div className="rule-text">
                                            <strong>TESTING PROTOCOL:</strong> Utilize local test cases to validate logic before transmission.
                                        </div>
                                    </div>
                                    <div className="rule-item">
                                        <span className="rule-nb">04</span>
                                        <div className="rule-text">
                                            <strong>HIDDEN ENCRYPTION:</strong> Hidden test cases will verify the robustness of your solution.
                                        </div>
                                    </div>
                                    <div className="rule-item">
                                        <span className="rule-nb">05</span>
                                        <div className="rule-text">
                                            <strong>TEMPORAL LIMIT:</strong> Decryption must be completed within the allocated 30-minute window.
                                        </div>
                                    </div>
                                    <div className="rule-item">
                                        <span className="rule-nb">06</span>
                                        <div className="rule-text">
                                            <strong>FINAL UPLOAD:</strong> Submission gate opens only in the final 180 seconds of the mission.
                                        </div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <span className="secure-line">ENCRYPTION: AES-256-BIT</span>
                                    <span className="status-line">CONNECTION: SECURE</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rules-section">
                            <div className="participation-card">
                                <div className="thank-you-text" data-text="THANK YOU FOR PARTICIPATION">
                                    THANK YOU FOR PARTICIPATION
                                </div>
                                <p className="participation-subtext">
                                    MATCH PROTOCOLS CONCLUDED // SESSION TERMINATED
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CrackCodeLobby;
