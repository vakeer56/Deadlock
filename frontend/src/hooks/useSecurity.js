import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { getSecuritySettings } from '../api/securityAdmin';

const useSecurity = (teamName) => {
    const [security, setSecurity] = useState({
        disableCopyPaste: false
    });
    const socketRef = useRef();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getSecuritySettings();
                if (res.success) {
                    setSecurity(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(res.settings)) {
                            return res.settings;
                        }
                        return prev;
                    });
                }
            } catch (err) {
                console.error(">>> [SECURITY_HOOK] Fetch failed:", err);
            }
        };

        // Initial fetch
        fetchSettings();

        // Polling fallback (every 10 seconds)
        const pollInterval = setInterval(fetchSettings, 10000);

        // Socket setup
        const socketHost = '/';

        socketRef.current = io(socketHost, {
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 20000,
            transports: ['websocket', 'polling']
        });


        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-team', teamName);
        });

        socketRef.current.on('security-settings-updated', (newSettings) => {
            setSecurity(newSettings);
            // Visual feedback for admin testing
            const toast = document.createElement('div');
            toast.textContent = "SECURITY POLICY UPDATED";
            toast.style.cssText = "position:fixed;top:10px;right:10px;background:red;color:white;padding:10px;z-index:9999;font-family:monospace;border:2px solid gold;box-shadow:0 0 10px gold;";
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error(">>> [SECURITY_HOOK] Connection error:", error);
        });

        return () => {
            clearInterval(pollInterval);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [teamName]);




    const reportAction = useCallback((type, message) => {
        if (socketRef.current) {
            socketRef.current.emit(type === 'ALERT' ? 'report-illegal-action' : 'report-tab-switch', {
                teamName,
                message,
                timestamp: new Date()
            });
        }
    }, [teamName]);

    // 🚨 HIGH-IMPACT CYBER ALERT UI 🚨
    const showSecurityAlert = useCallback((message) => {
        const id = 'security-alert-' + Math.random().toString(36).substr(2, 9);
        const container = document.createElement('div');
        container.id = id;

        container.innerHTML = `
            <div class="cyber-alert-frame">
                <div class="alert-glitch-overlay"></div>
                <div class="alert-scanner"></div>
                <div class="alert-icon">⚠️</div>
                <div class="alert-body">
                    <div class="alert-title">SECURITY_VIOLATION_DETECTED</div>
                    <div class="alert-msg">${message.toUpperCase()}</div>
                </div>
                <div class="alert-status-bar">
                    <span>STATUS: REPORTED_TO_CORE</span>
                    <span class="alert-timer">00:${Math.floor(Math.random() * 90 + 10)}</span>
                </div>
            </div>
        `;

        container.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            z-index: 2147483647;
            pointer-events: none;
            animation: alertSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        `;

        if (!document.getElementById('cyber-alert-styles')) {
            const style = document.createElement('style');
            style.id = 'cyber-alert-styles';
            style.innerHTML = `
                @keyframes alertSlideIn {
                    from { transform: translateX(120%) skewX(-10deg); opacity: 0; }
                    to { transform: translateX(0) skewX(0); opacity: 1; }
                }
                @keyframes alertGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(255, 0, 60, 0.4), inset 0 0 10px rgba(255, 0, 60, 0.2); }
                    50% { box-shadow: 0 0 40px rgba(255, 0, 60, 0.6), inset 0 0 20px rgba(255, 0, 60, 0.4); }
                }
                @keyframes alertScan {
                    0% { top: -100%; }
                    100% { top: 200%; }
                }
                .cyber-alert-frame {
                    background: rgba(10, 0, 0, 0.95);
                    border: 1px solid #ff003c;
                    padding: 15px 25px;
                    min-width: 320px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    animation: alertGlow 2s infinite;
                    backdrop-filter: blur(10px);
                }
                .cyber-alert-frame::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 0; bottom: 0;
                    width: 4px;
                    background: #ff003c;
                }
                .alert-scanner {
                    position: absolute;
                    left: 0; right: 0;
                    height: 2px;
                    background: rgba(255, 0, 60, 0.5);
                    box-shadow: 0 0 15px #ff003c;
                    animation: alertScan 3s linear infinite;
                    z-index: 2;
                }
                .alert-icon {
                    font-size: 24px;
                    filter: drop-shadow(0 0 5px #ff003c);
                }
                .alert-title {
                    color: #ff003c;
                    font-weight: 900;
                    font-size: 12px;
                    letter-spacing: 2px;
                    margin-bottom: 4px;
                }
                .alert-msg {
                    color: #fff;
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: 1px;
                }
                .alert-status-bar {
                    position: absolute;
                    bottom: 0; left: 4px; right: 0;
                    background: rgba(255, 0, 60, 0.1);
                    display: flex;
                    justify-content: space-between;
                    padding: 2px 10px;
                    font-size: 9px;
                    color: rgba(255, 255, 255, 0.5);
                    letter-spacing: 1px;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(container);

        // Auto-remove
        setTimeout(() => {
            if (container.parentNode) {
                container.style.transition = 'all 0.5s ease-in';
                container.style.transform = 'translateX(120%)';
                container.style.opacity = '0';
                setTimeout(() => container.remove(), 500);
            }
        }, 8000);
    }, []);

    useEffect(() => {
        // Tab Visibility Change Detection
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                reportAction('TAB_SWITCH', 'Switched tabs or minimized window');
                showSecurityAlert('Tab switch detected');
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Global Clipboard Interception (Paste, Copy, Cut)
        const handleClipboard = (e) => {
            if (security.disableCopyPaste) {
                e.preventDefault();
                e.stopPropagation();
                reportAction('ALERT', `Blocked ${e.type} attempt`);
                showSecurityAlert(`Action Restricted: ${e.type}`);
            }
        };
        document.addEventListener('paste', handleClipboard, true);
        document.addEventListener('copy', handleClipboard, true);
        document.addEventListener('cut', handleClipboard, true);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('paste', handleClipboard, true);
            document.removeEventListener('copy', handleClipboard, true);
            document.removeEventListener('cut', handleClipboard, true);
        };

    }, [security, reportAction, showSecurityAlert]);






    return { security, reportAction };
};

export default useSecurity;
