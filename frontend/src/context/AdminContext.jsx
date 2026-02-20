import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [logs, setLogs] = useState([]);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef();

    useEffect(() => {
        const hostname = window.location.hostname || 'localhost';
        const socketHost = `http://${hostname}:5000`;

        socketRef.current = io(socketHost, {
            transports: ['websocket', 'polling']
        });

        socketRef.current.on('connect', () => {
            console.log(">>> [ADMIN_CONTEXT] Socket connected ID:", socketRef.current.id);
            setConnected(true);
            socketRef.current.emit('join-admin');
        });

        socketRef.current.on('new-log', (log) => {
            console.log(">>> [ADMIN_CONTEXT] Received new log:", log);
            setLogs(prev => [log, ...prev].slice(0, 100)); // Keep last 100 logs
        });

        socketRef.current.on('connect_error', (err) => {
            console.error(">>> [ADMIN_CONTEXT] Socket error:", err);
            setConnected(false);
        });

        socketRef.current.on('disconnect', () => {
            console.log(">>> [ADMIN_CONTEXT] Socket disconnected");
            setConnected(false);
        });

        return () => {
            if (socketRef.current) {
                console.log(">>> [ADMIN_CONTEXT] Cleaning up socket connection");
                socketRef.current.disconnect();
            }
        };
    }, []);

    const value = {
        logs,
        connected,
        socket: socketRef.current
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
