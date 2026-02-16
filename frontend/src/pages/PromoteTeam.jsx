import React, { useState } from 'react';
import { getMatchByTeamName, promoteTeam } from '../api/deadlockAdmin';
import './PromoteTeam.css';

const PromoteTeam = () => {
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [match, setMatch] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchMatch = async () => {
        if (!teamName) return;
        setLoading(true);
        setError('');
        setMatch(null);
        setMessage('');
        try {
            const data = await getMatchByTeamName(teamName);
            if (data.success) {
                setMatch(data.match);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch match');
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async (teamId, teamLabel) => {
        if (!match) return;
        if (!window.confirm(`Are you sure you want to FORCE WIN for Team ${teamLabel}?`)) return;

        setLoading(true);
        setError('');
        setMessage('');
        try {
            const data = await promoteTeam(match._id, teamId);
            if (data.success) {
                setMessage(`SUCCESS: Team ${teamLabel} has been promoted to next round.`);
                setMatch(null); // Clear match after promotion
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to promote team');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="promote-container">
            <div className="cyber-grid-overlay"></div>

            <div className="promote-header">
                <h1>Priority Promotion Override</h1>
            </div>

            <div className="promote-search">
                <input
                    type="text"
                    placeholder="ENTER TARGET TEAM NAME..."
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchMatch()}
                />
                <button className="promote-btn" onClick={fetchMatch} disabled={loading}>
                    {loading ? 'UPLOADING...' : 'QUERY DATABASE'}
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {message && <div className="success-msg">{message}</div>}

            {match && (
                <div className="promote-match-card">
                    <div className="cyber-corner top-left"></div>
                    <div className="cyber-corner top-right"></div>
                    <div className="cyber-corner bottom-left"></div>
                    <div className="cyber-corner bottom-right"></div>

                    <div className="promote-teams-display">
                        <div className="promote-team-section">
                            <span className="team-label">Team Alpha (A)</span>
                            <span className={`team-name alpha ${match.teamA.name.toLowerCase() === teamName.toLowerCase() ? 'active-target' : ''}`}>
                                {match.teamA.name}
                            </span>
                            <button
                                className="promote-btn promote-action-btn promote-alpha-btn"
                                onClick={() => handlePromote(match.teamA._id, 'Alpha')}
                                disabled={loading}
                            >
                                {loading ? 'EXECUTING...' : 'PROMOTE ALPHA'}
                            </button>
                        </div>

                        <div className="promote-vs">VS</div>

                        <div className="promote-team-section">
                            <span className="team-label">Team Gamma (B)</span>
                            <span className={`team-name omega ${match.teamB.name.toLowerCase() === teamName.toLowerCase() ? 'active-target' : ''}`}>
                                {match.teamB.name}
                            </span>
                            <button
                                className="promote-btn promote-action-btn promote-gamma-btn"
                                onClick={() => handlePromote(match.teamB._id, 'Gamma')}
                                disabled={loading}
                            >
                                {loading ? 'EXECUTING...' : 'PROMOTE GAMMA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoteTeam;
