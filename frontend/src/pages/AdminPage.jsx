import { useState, useEffect } from 'react';
import {
    getTeams,
    createMatch,
    updateMatchTeams,
    swapMatchTeams,
    resetMatch,
    startAllMatches
} from '../api/deadlockAdmin';
import TeamCard from '../components/TeamCard';
import './Admin.css';

const AdminPage = () => {
    const [unassignedTeams, setUnassignedTeams] = useState([]);
    const [teamA, setTeamA] = useState([]);
    const [teamB, setTeamB] = useState([]);

    const [matchId, setMatchId] = useState(null);
    const [loading, setLoading] = useState(true);

    const [gameStarted, setGameStarted] = useState(false);
    const [initializationProgress, setInitializationProgress] = useState(0);

    const [draggedTeam, setDraggedTeam] = useState(null);
    const [sourceColumn, setSourceColumn] = useState(null);

    const [toast, setToast] = useState(null);

    useEffect(() => {
        document.title = "Deadlock // Admin";
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const data = await getTeams();
                setUnassignedTeams(data.teams || []);
                setTeamA([]);
                setTeamB([]);
            } catch (err) {
                console.error(err);
                showToast("Failed to load teams");
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    // Progress bar simulation for dramatic effect
    useEffect(() => {
        if (gameStarted && initializationProgress < 100) {
            const timer = setTimeout(() => {
                setInitializationProgress(prev => Math.min(prev + (Math.random() * 15), 100));
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [gameStarted, initializationProgress]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleDragStart = (e, team, source) => {
        setDraggedTeam(team);
        setSourceColumn(source);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const removeFromSource = () => {
        if (sourceColumn === 'unassigned') {
            setUnassignedTeams(prev => prev.filter(t => t._id !== draggedTeam._id));
        }
        if (sourceColumn === 'teamA') {
            setTeamA(prev => prev.filter(t => t._id !== draggedTeam._id));
        }
        if (sourceColumn === 'teamB') {
            setTeamB(prev => prev.filter(t => t._id !== draggedTeam._id));
        }
    };

    const handleDrop = (e, targetColumn, targetTeam = null) => {
        e.preventDefault();
        if (!draggedTeam) return;

        // If dropping on self in same column, do nothing
        if (sourceColumn === targetColumn && targetTeam && draggedTeam._id === targetTeam._id) return;

        const updateList = (prev) => {
            const filtered = prev.filter(t => t._id !== draggedTeam._id);
            if (targetTeam) {
                const targetIndex = filtered.findIndex(t => t._id === targetTeam._id);
                const newList = [...filtered];
                newList.splice(targetIndex, 0, draggedTeam); // Insert before target
                return newList;
            }
            return [...filtered, draggedTeam]; // Append if no specific target team
        };

        if (targetColumn === 'unassigned') {
            setUnassignedTeams(prev => updateList(prev));
            if (sourceColumn === 'teamA') setTeamA(prev => prev.filter(t => t._id !== draggedTeam._id));
            if (sourceColumn === 'teamB') setTeamB(prev => prev.filter(t => t._id !== draggedTeam._id));
        }

        if (targetColumn === 'teamA') {
            setTeamA(prev => updateList(prev));
            if (sourceColumn === 'unassigned') setUnassignedTeams(prev => prev.filter(t => t._id !== draggedTeam._id));
            if (sourceColumn === 'teamB') setTeamB(prev => prev.filter(t => t._id !== draggedTeam._id));
        }

        if (targetColumn === 'teamB') {
            setTeamB(prev => updateList(prev));
            if (sourceColumn === 'unassigned') setUnassignedTeams(prev => prev.filter(t => t._id !== draggedTeam._id));
            if (sourceColumn === 'teamA') setTeamA(prev => prev.filter(t => t._id !== draggedTeam._id));
        }

        setDraggedTeam(null);
        setSourceColumn(null);
    };


    const handleSwap = async () => {
        const temp = teamA;
        setTeamA(teamB);
        setTeamB(temp);

        if (matchId) {
            try {
                await swapMatchTeams(matchId);
            } catch {
                showToast("Swap failed on server");
            }
        }
    };

    const handleClearBoard = () => {
        setUnassignedTeams(prev => [...prev, ...teamA, ...teamB]);
        setTeamA([]);
        setTeamB([]);
        setMatchId(null);
        showToast("Board cleared");
    };

    const handleStartAll = async () => {
        try {
            await startAllMatches();
            setGameStarted(true); // Trigger the big transition
            setUnassignedTeams([]);
            setTeamA([]);
            setTeamB([]);
        } catch (err) {
            console.error(err);
            showToast("Failed to start all matches");
        }
    };


    if (gameStarted) {
        return (
            <div className="admin-page-root game-started">
                <div className="admin-scanlines"></div>
                <div className="admin-grid-overlay"></div>

                <div className="initialization-overlay">
                    <div className="init-content">
                        <div className="tech-spinner">
                            <div className="spinner-inner"></div>
                            <div className="spinner-outer"></div>
                            <div className="spinner-center">
                                <div className="deadlock-icon">D</div>
                            </div>
                        </div>

                        <div className="status-container">
                            <h2 className="glitch-text" data-text="DEADLOCK INITIATED">DEADLOCK INITIATED</h2>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${initializationProgress}%` }}></div>
                                <div className="progress-percentage">{Math.floor(initializationProgress)}%</div>
                            </div>
                            <div className="status-log">
                                <p className={initializationProgress > 20 ? 'visible' : ''}>NEURAL LINK ESTABLISHED...</p>
                                <p className={initializationProgress > 45 ? 'visible' : ''}>MATCH PROTOCOLS LIVE...</p>
                                <p className={initializationProgress > 70 ? 'visible' : ''}>TERMINAL ACCESS GRANTED...</p>
                                <p className={initializationProgress > 90 ? 'visible' : ''}>SYSTEMS STABLE. BEGINNING...</p>
                            </div>
                        </div>

                        <button onClick={() => setGameStarted(false)} className="cyber-btn secondary return-btn">
                            RETURN TO DASHBOARD
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page-root">
            <div className="admin-scanlines"></div>
            <div className="admin-grid-overlay"></div>

            <div className="admin-container">
                {toast && (
                    <div className={`cyber-toast ${toast.toLowerCase().includes('failed') ? 'error' : 'success'}`}>
                        {toast}
                    </div>
                )}

                <header className="admin-header">
                    <div className="header-brand">
                        <div className="brand-accent"></div>
                        <h1>DEADLOCK // SYSTEM ADMIN</h1>
                    </div>
                    <div className="admin-actions">
                        <button
                            onClick={handleStartAll}
                            className="cyber-btn primary"
                            disabled={teamA.length === 0 || teamA.length !== teamB.length}
                        >
                            <span className="btn-glitch"></span>
                            INITIALIZE ALL MATCHES
                        </button>
                        <button
                            onClick={handleSwap}
                            className="cyber-btn secondary"
                            disabled={teamA.length === 0 && teamB.length === 0}
                        >
                            SWAP PROTOCOL
                        </button>
                        <button
                            onClick={handleClearBoard}
                            className="cyber-btn danger"
                            disabled={teamA.length === 0 && teamB.length === 0}
                        >
                            PURGE BOARD
                        </button>
                    </div>
                </header>

                <div className="board">
                    {/* UNASSIGNED */}
                    <div
                        className="column"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'unassigned')}
                    >
                        <div className="column-header">
                            Unassigned ({unassignedTeams.length})
                        </div>
                        <div className="column-content">
                            {loading ? "Loading..." :
                                unassignedTeams.map(team => (
                                    <TeamCard
                                        key={team._id}
                                        team={team}
                                        onDragStart={(e) =>
                                            handleDragStart(e, team, 'unassigned')
                                        }
                                        onDrop={(e) => handleDrop(e, 'unassigned', team)}
                                    />
                                ))
                            }
                        </div>
                    </div>

                    {/* TEAM ALPHA */}
                    <div
                        className="column column-alpha"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'teamA')}
                    >
                        <div className="column-header">TEAM ALPHA</div>
                        <div className="column-content">
                            {teamA.map(team => (
                                <TeamCard
                                    key={team._id}
                                    team={team}
                                    onDragStart={(e) =>
                                        handleDragStart(e, team, 'teamA')
                                    }
                                    onDrop={(e) => handleDrop(e, 'teamA', team)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* TEAM GAMMA */}
                    <div
                        className="column column-gamma"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'teamB')}
                    >
                        <div className="column-header">TEAM GAMMA</div>
                        <div className="column-content">
                            {teamB.map(team => (
                                <TeamCard
                                    key={team._id}
                                    team={team}
                                    onDragStart={(e) =>
                                        handleDragStart(e, team, 'teamB')
                                    }
                                    onDrop={(e) => handleDrop(e, 'teamB', team)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
