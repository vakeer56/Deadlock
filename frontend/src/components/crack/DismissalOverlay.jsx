import React from 'react';
import './DismissalOverlay.css';

const DismissalOverlay = () => {
    return (
        <div className="dismissal-overlay-root">
            <div className="glitch-static"></div>
            <div className="red-scanlines"></div>

            <div className="dismissal-content">
                <div className="halt-symbol">✖</div>
                <h1 className="dismissal-text" data-text="SYSTEM HALTED">
                    SYSTEM HALTED
                </h1>

                <div className="dismissal-subtext">
                    [ ACCESS REVOKED BY OVERRIDE ]
                </div>

                <div className="reason-box">
                    MESSAGE: <span className="reason-value">GAME DISMISSED BY THE ADMIN</span>
                </div>

                <div className="deauth-container">
                    <div className="deauth-label">DE-AUTHENTICATING UNIT...</div>
                    <div className="deauth-progress-wrapper">
                        <div className="deauth-progress-bar"></div>
                    </div>
                </div>

                <div className="terminal-halt-logs">
                    <p>&gt; SIGTERM RECEIVED</p>
                    <p>&gt; PURGING SESSION_CACHE...</p>
                    <p>&gt; DISCONNECTING NEURAL_LINK...</p>
                    <p>&gt; RETURN_TO_LOBBY: INITIATED</p>
                </div>
            </div>

            <div className="chromatic-aberration"></div>
        </div>
    );
};

export default DismissalOverlay;
