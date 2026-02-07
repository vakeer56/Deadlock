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

    const [draggedTeam, setDraggedTeam] = useState(null);
    const [sourceColumn, setSourceColumn] = useState(null);

    const [toast, setToast] = useState(null);

    useEffect(() => {
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

    const handleDrop = (e, targetColumn) => {
        e.preventDefault();

        if (!draggedTeam || sourceColumn === targetColumn) return;

        removeFromSource();

        if (targetColumn === 'unassigned') {
            setUnassignedTeams(prev => [...prev, draggedTeam]);
        }

        if (targetColumn === 'teamA') {
            setTeamA(prev => [...prev, draggedTeam]);
        }

        if (targetColumn === 'teamB') {
            setTeamB(prev => [...prev, draggedTeam]);
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
            const res = await startAllMatches();
            showToast(`Started ${res.totalMatches} matches`);
            setUnassignedTeams([]);
            setTeamA([]);
            setTeamB([]);
        } catch (err) {
            console.error(err);
            showToast("Failed to start all matches");
        }
    };


    return (
        <div className="admin-container">
            {toast && <div className="toast">{toast}</div>}

            <header className="admin-header">
                <h1>DEADLOCK ADMIN</h1>
                <div className="admin-actions">
                    <button onClick={handleStartAll} className="btn-primary">START ALL MATCHES</button>
                    <button onClick={handleSwap}>SWAP</button>
                    <button onClick={handleClearBoard} style={{ color: 'red' }}>
                        CLEAR BOARD
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
                                />
                            ))
                        }
                    </div>
                </div>

                {/* TEAM A */}
                <div
                    className="column"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'teamA')}
                >
                    <div className="column-header">TEAM A</div>
                    <div className="column-content">
                        {teamA.map(team => (
                            <TeamCard
                                key={team._id}
                                team={team}
                                onDragStart={(e) =>
                                    handleDragStart(e, team, 'teamA')
                                }
                            />
                        ))}
                    </div>
                </div>

                {/* TEAM B */}
                <div
                    className="column"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'teamB')}
                >
                    <div className="column-header">TEAM B</div>
                    <div className="column-content">
                        {teamB.map(team => (
                            <TeamCard
                                key={team._id}
                                team={team}
                                onDragStart={(e) =>
                                    handleDragStart(e, team, 'teamB')
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
