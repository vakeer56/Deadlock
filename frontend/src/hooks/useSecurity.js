import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { getSecuritySettings } from '../api/securityAdmin';

const useSecurity = (teamName) => {
    const [security, setSecurity] = useState({
        disableCopyPaste: false
    });
    const socketRef = useRef();

    useEffect(() => {
        console.log(">>> [SECURITY_HOOK] Initializing for team:", teamName);

        const fetchSettings = async () => {
            try {
                const res = await getSecuritySettings();
                if (res.success) {
                    setSecurity(prev => {
                        if (JSON.stringify(prev) !== JSON.stringify(res.settings)) {
                            console.log(">>> [SECURITY_HOOK] Policy Synchronized via Polling/Broadcast");
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
        console.log(">>> [SECURITY_HOOK] Connecting to socket at:", socketHost);

        socketRef.current = io(socketHost, {
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 20000,
            transports: ['websocket', 'polling']
        });


        socketRef.current.on('connect', () => {
            console.log(">>> [SECURITY_HOOK] Connected to server. ID:", socketRef.current.id);
            socketRef.current.emit('join-team', teamName);
        });

        socketRef.current.on('security-settings-updated', (newSettings) => {
            console.log(">>> [SECURITY_HOOK] Received security update:", newSettings);
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
                console.log(">>> [SECURITY_HOOK] Disconnecting socket");
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

    // 🚨 SMALL TOP-RIGHT TOAST UI 🚨
    const showSecurityAlert = useCallback((message) => {
        const id = 'security-toast-' + Math.random().toString(36).substr(2, 9);
        const toast = document.createElement('div');
        toast.id = id;
        toast.innerHTML = `
            <div style="font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.3); margin-bottom: 5px; padding-bottom: 3px;">
                SECURITY ALERT
            </div>
            <div style="font-size: 13px;">${message.toUpperCase()}</div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(180, 0, 0, 0.9);
            color: white;
            padding: 12px 20px;
            z-index: 100000;
            border-left: 4px solid #ffcc00;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            text-align: left;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            pointer-events: none;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-radius: 4px;
            animation: toastSlideIn 0.3s ease-out;
            min-width: 200px;
        `;

        if (!document.getElementById('security-toast-animation')) {
            const style = document.createElement('style');
            style.id = 'security-toast-animation';
            style.innerHTML = `
                @keyframes toastSlideIn {
                    from { transform: translateX(110%); }
                    to { transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => toast.remove(), 500);
            }
        }, 10000); // 10 seconds
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
