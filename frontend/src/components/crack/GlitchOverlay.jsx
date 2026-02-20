import React from 'react';
import './GlitchOverlay.css';

const GlitchOverlay = ({ ownerName, remaining = 0 }) => {
    const [timeLeft, setTimeLeft] = React.useState(remaining);

    React.useEffect(() => {
        setTimeLeft(remaining);
    }, [remaining]);

    React.useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    return (
        <div className="glitch-overlay-root">
            <div className="glitch-noise"></div>
            <div className="glitch-scanlines"></div>

            <div className="glitch-content">
                <div className="warning-symbol">⚠️</div>
                <h1 className="glitch-text" data-text="SYSTEM BREACH DETECTED">
                    SYSTEM BREACH DETECTED
                </h1>

                <div className="attack-source">
                    SOURCE: <span className="source-name">{ownerName || "UNKNOWN"}</span>
                </div>

                <div className="lockout-timer">
                    ACCESS RESTORING IN...
                    <span className="timer-count">{timeLeft}S</span>
                </div>

                <div className="terminal-log">
                    <p>&gt; INTRUSION DETECTED</p>
                    <p>&gt; ROOT ACCESS: DENIED</p>
                    <p>&gt; INPUT_STREAM: CORRUPTED</p>
                    <p>&gt; REBOOTING KERNEL...</p>
                </div>
            </div>
        </div>
    );
};

export default GlitchOverlay;
