import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getSecuritySettings, updateSecuritySettings } from '../api/securityAdmin';
import './AdminSecurity.css';

const AdminSecurity = () => {
    const [settings, setSettings] = useState({
        disableCopyPaste: false,
        disableTextSelection: false,
        allowDevTools: true
    });
    const [logs, setLogs] = useState([]);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef();

    useEffect(() => {
        console.log(">>> [ADMIN_SECURITY] Mounting Dashboard");
        // Fetch initial settings
        const fetchSettings = async () => {
            try {
                const res = await getSecuritySettings();
                if (res.success) {
                    console.log(">>> [ADMIN_SECURITY] Fetched settings:", res.settings);
                    setSettings(res.settings);
                }
            } catch (err) {
                console.error(">>> [ADMIN_SECURITY] Failed to fetch settings", err);
            }
        };
        fetchSettings();

        // Connect to Socket.io
        const hostname = window.location.hostname || 'localhost';
        const socketHost = `http://${hostname}:5000`;
        console.log(">>> [ADMIN_SECURITY] Connecting socket to:", socketHost);
        socketRef.current = io(socketHost, {
            transports: ['websocket', 'polling']
        });


        socketRef.current.on('connect', () => {
            console.log(">>> [ADMIN_SECURITY] Socket connected ID:", socketRef.current.id);
            setConnected(true);
            socketRef.current.emit('join-admin');
        });

        socketRef.current.on('new-log', (log) => {
            console.log(">>> [ADMIN_SECURITY] Received new log:", log);
            setLogs(prev => [log, ...prev].slice(0, 100)); // Keep last 100 logs
        });

        socketRef.current.on('connect_error', (err) => {
            console.error(">>> [ADMIN_SECURITY] Socket error:", err);
            setConnected(false);
        });

        socketRef.current.on('disconnect', () => {
            console.log(">>> [ADMIN_SECURITY] Socket disconnected");
            setConnected(false);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);


    const handleToggle = async (key) => {
        const newValue = !settings[key];
        console.log(`>>> [ADMIN_SECURITY] Toggling ${key} to ${newValue}`);
        const newSettings = { ...settings, [key]: newValue };
        setSettings(newSettings);
        try {
            const res = await updateSecuritySettings(newSettings);
            console.log(">>> [ADMIN_SECURITY] Update success response:", res);
        } catch (err) {
            console.error(">>> [ADMIN_SECURITY] Failed to update settings", err);
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
    };


    return (
        <div className="admin-security-container">
            <div className="cyber-bg"></div>
            <div className="cyber-header">
                <h1 className="cyber-title glitch" data-text="SECURITY OVERRIDE">SECURITY OVERRIDE</h1>
                <div className={`connection-status ${connected ? 'stable' : 'offline'}`}>
                    {connected ? 'CORE CONNECTED' : 'CORE OFFLINE'}
                </div>
            </div>

            <div className="security-content">
                <div className="settings-panel">
                    <h2 className="panel-title">CONTROL PARAMETERS</h2>
                    <div className="toggle-group">
                        <div className="toggle-item">
                            <div className="toggle-info">
                                <span className="toggle-label">DISABLE COPY/PASTE</span>
                                <span className="toggle-desc">Blocks all paste events in code editors</span>
                            </div>
                            <label className="cyber-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.disableCopyPaste}
                                    onChange={() => handleToggle('disableCopyPaste')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                    </div>
                </div>

                <div className="logs-panel">
                    <h2 className="panel-title">REAL-TIME ACTIVITY LOG</h2>
                    <div className="logs-viewport">
                        {logs.length === 0 && <div className="no-logs">LISTENING FOR ACTIVITY...</div>}
                        {logs.map((log, i) => (
                            <div key={i} className={`log-entry ${log.type.toLowerCase()}`}>
                                <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className="log-team">[{log.teamName || 'UNKNOWN'}]</span>
                                <span className="log-msg">{log.message || log.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSecurity;
