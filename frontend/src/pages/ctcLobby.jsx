import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/login.css'; 

const CTCLobby = () => {
    const navigate = useNavigate();
    const [eventStatus, setEventStatus] = useState("waiting"); // waiting, active
    
    // Placeholder for checking event status from backend
    const checkEventStatus = async () => {
        try {
            // TODO: Connect to actual backend endpoint when available
            console.log("Checking event status...");
        } catch (error) {
            console.error("Failed to check status", error);
        }
    };

    useEffect(() => {
        const interval = setInterval(checkEventStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleStartGame = () => {
        navigate("/login");
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#050505',
            color: '#ffffff',
            fontFamily: '"Inter", sans-serif',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden'
        }}>
            {/* Navbar */}
            <header style={{
                padding: '2rem 4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
                background: 'rgba(5, 5, 5, 0.8)',
                backdropFilter: 'blur(10px)',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100
            }}>
                <div style={{ 
                    fontSize: '24px', 
                    fontFamily: '"Orbitron", sans-serif', 
                    fontWeight: '700',
                    color: 'aquamarine', 
                    letterSpacing: '2px',
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                }}>
                    TAKSHASHILA 2K26
                </div>
                <div style={{ 
                    fontSize: '24px', 
                    fontFamily: '"Orbitron", sans-serif', 
                    fontWeight: '700',
                    color: '#ffd700', 
                    letterSpacing: '2px',
                   
                }}>
                    CELESTIUS
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginTop: '80px', // Compensate for fixed header
                padding: '0 20px'
            }}>
                {/* Background Ambient Effect */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60vw',
                    height: '60vw',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.03) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }}></div>

                {/* Hero Title */}
                <h1 style={{
                    fontSize: 'clamp(3rem, 8vw, 8rem)',
                    fontFamily: '"Orbitron", sans-serif',
                    fontWeight: '700',
                    background: 'linear-gradient(180deg, #ffffff 0%, #444444 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 1rem 0',
                    letterSpacing: 'clamp(5px, 1vw, 15px)',
                    zIndex: 1,
                    textAlign: 'center'
                }}>
                    CRACK THE CODE
                </h1>

                <div style={{ 
                    height: '2px', 
                    width: '100px', 
                    background: '#ffd700', 
                    margin: '0 auto 3rem',
                    opacity: 0.7,
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
                }}></div>

                <p style={{
                    fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                    color: '#888',
                    maxWidth: '600px',
                    textAlign: 'center',
                    marginBottom: '4rem',
                    lineHeight: '1.8',
                    zIndex: 1
                }}>
                    The system is waiting for your initialization. 
                    <br />
                    Status: <span style={{ 
                        color: eventStatus === 'active' ? '#00ff9d' : '#ffd700',
                        fontWeight: 'bold',
                        textShadow: eventStatus === 'active' ? '0 0 10px rgba(0,255,157,0.5)' : '0 0 10px rgba(255,215,0,0.3)'
                    }}>{eventStatus.toUpperCase()}</span>
                </p>

                {/* Action Button */}
                <div style={{ zIndex: 1 }}>
                    {eventStatus === 'active' ? (
                        <button 
                            onClick={handleStartGame} 
                            style={{
                                padding: '1.2rem 4rem',
                                fontSize: '1.2rem',
                                fontFamily: '"Orbitron", sans-serif',
                                fontWeight: 'bold',
                                color: '#000',
                                background: '#ffd700',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                letterSpacing: '2px',
                                boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 0 50px rgba(255, 215, 0, 0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.3)';
                            }}
                        >
                            ENTER PROTOCOL
                        </button>
                    ) : (
                        <div style={{
                            padding: '1rem 3rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#555',
                            fontFamily: '"Orbitron", sans-serif',
                            letterSpacing: '2px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            backdropFilter: 'blur(5px)',
                            borderRadius: '4px'
                        }}>
                            WAITING FOR HOST...
                        </div>
                    )}
                </div>

                {/* Rules Grid */}
                <div style={{
                    marginTop: '6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: '100%',
                    maxWidth: '800px',
                    padding: '0 2rem',
                    zIndex: 1
                }}>
                     {[
                         { title: 'TEAM COMPOSITION', desc: 'Teams must consist of exactly 3 members.' },
                         { title: 'COMMUNICATION PROTOCOL', desc: 'No external communication devices allowed.' },
                         { title: 'ADMIN AUTHORITY', desc: 'The admin\'s decision is final and binding.' },
                         { title: 'INTEGRITY CHECK', desc: 'Code integrity verification will be active.' }
                     ].map((rule, i) => (
                         <div key={i} style={{
                             display: 'flex',
                             alignItems: 'baseline',
                             padding: '1rem',
                             background: 'rgba(255, 255, 255, 0.03)',
                             borderRadius: '8px',
                             border: '1px solid rgba(255, 255, 255, 0.05)',
                             transition: 'all 0.3s ease'
                         }}
                         onMouseOver={(e) => {
                             e.currentTarget.style.background = 'rgba(255, 215, 0, 0.05)';
                             e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                         }}
                         onMouseOut={(e) => {
                             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                             e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                         }}
                         >
                             <div style={{
                                 color: '#ffd700',
                                 fontFamily: '"Orbitron", sans-serif',
                                 fontSize: '1.2rem',
                                 fontWeight: 'bold',
                                 marginRight: '1.5rem',
                                 minWidth: '40px'
                             }}>
                                 0{i+1}
                             </div>
                             <div style={{ textAlign: 'left' }}>
                                <div style={{
                                     color: '#fff',
                                     fontFamily: '"Orbitron", sans-serif',
                                     fontSize: '1rem',
                                     marginBottom: '0.2rem',
                                     letterSpacing: '1px'
                                 }}>
                                     {rule.title}
                                 </div>
                                 <div style={{
                                     color: '#888',
                                     fontSize: '0.9rem',
                                     lineHeight: '1.4'
                                 }}>
                                     {rule.desc}
                                 </div>
                             </div>
                         </div>
                     ))}
                </div>
            </main>
        </div>
    );
};

export default CTCLobby;
