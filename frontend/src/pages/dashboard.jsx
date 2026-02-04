import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/login');
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            backgroundColor: '#050505',
            color: '#fff',
            fontFamily: '"Exo 2", sans-serif',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Ambient Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(20, 20, 30, 1) 0%, rgba(5, 5, 5, 1) 100%)',
                zIndex: 0
            }}></div>

            {/* Grid Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                zIndex: 1,
                opacity: 0.5
            }}></div>

            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '2rem 4rem',
                zIndex: 10,
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    letterSpacing: '4px',
                    color: '#fff',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                }}>
                    TAKSHASHILA 2K26
                </div>
                <div style={{
                   display: 'flex',
                   gap: '2rem',
                   alignItems: 'center',
                   color: 'rgba(255, 255, 255, 0.6)',
                   fontSize: '0.9rem',
                   letterSpacing: '1px'
                }}>
                    <span>SYSTEM STATUS: ONLINE</span>
                    <span>V 2.0.4</span>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(0, 255, 255, 0.05) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    zIndex: -1
                }}></div>

                <div style={{
                    marginBottom: '1rem',
                    color: '#00ffff',
                    letterSpacing: '5px',
                    fontSize: '1.2rem',
                    textTransform: 'uppercase'
                }}>
                    Welcome to the Arena
                </div>

                <h1 style={{
                    fontSize: '7rem',
                    margin: 0,
                    fontWeight: '900',
                    lineHeight: '1',
                    background: 'linear-gradient(180deg, #ffffff 0%, #888888 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    letterSpacing: '10px'
                }}>
                    CELESTIUS
                </h1>

                <p style={{
                    maxWidth: '600px',
                    textAlign: 'center',
                    color: '#aaa',
                    marginTop: '2rem',
                    lineHeight: '1.6',
                    fontSize: '1.1rem',
                    marginBottom: '4rem'
                }}>
                    Prepare for the ultimate challenge. Code, compete, and conquer. 
                    The system awaits your command. Initialize your entry sequence now.
                </p>

                <button 
                    onClick={handleStart}
                    style={{
                        padding: '1.5rem 5rem',
                        fontSize: '1.5rem',
                        background: 'transparent',
                        border: '1px solid #00ffff',
                        color: '#00ffff',
                        cursor: 'pointer',
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                        e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    Initialize
                </button>
            </main>

            {/* Footer */}
            <footer style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '0.8rem',
                letterSpacing: '2px',
                zIndex: 10
            }}>
                SECURE CONNECTION ESTABLISHED // ID: 8492-AX
            </footer>
        </div>
    );
};

export default Dashboard;