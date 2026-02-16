import React, { useState } from 'react';
import { getMatchByTeamName, shuffleQuestion } from '../api/deadlockAdmin';
import './ShuffleQuestion.css';

const ShuffleQuestion = () => {
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

    const handleShuffle = async () => {
        if (!match) return;
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const data = await shuffleQuestion(match._id);
            if (data.success) {
                setMessage(data.message + ': ' + data.newQuestionTitle);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to shuffle question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shuffle-container">
            <div className="cyber-grid-overlay"></div>
            <div className="shuffle-header">
                <h1>Match Question Shuffler</h1>
            </div>

            <div className="shuffle-search">
                <input
                    type="text"
                    placeholder="Enter Team Name..."
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchMatch()}
                />
                <button className="shuffle-btn" onClick={fetchMatch} disabled={loading}>
                    {loading ? 'INITIATING...' : 'SCAN MATCH'}
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {message && <div className="success-msg">{message}</div>}

            {match && (
                <div className="match-details-card">
                    <div className="cyber-corner top-left"></div>
                    <div className="cyber-corner top-right"></div>
                    <div className="cyber-corner bottom-left"></div>
                    <div className="cyber-corner bottom-right"></div>

                    <div className="teams-display">
                        <div className="team-box">
                            <span className="team-label">Team Alpha (A)</span>
                            <span className={`team-name alpha ${match.teamA.name.toLowerCase() === teamName.toLowerCase() ? 'active-target' : ''}`}>
                                {match.teamA.name}
                            </span>
                        </div>
                        <div className="vs-divider">VS</div>
                        <div className="team-box">
                            <span className="team-label">Team Gamma (B)</span>
                            <span className={`team-name omega ${match.teamB.name.toLowerCase() === teamName.toLowerCase() ? 'active-target' : ''}`}>
                                {match.teamB.name}
                            </span>
                        </div>
                    </div>

                    <div className="match-stats">
                        <div className="stat-item">
                            <span className="stat-label">Tug Position</span>
                            <span className="stat-value" style={{ color: match.tugPosition < 0 ? '#ff0055' : '#00ffff' }}>
                                {match.tugPosition}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Current Index</span>
                            <span className="stat-value">{match.currentQuestionIndex}</span>
                        </div>
                    </div>

                    <div className="action-zone">
                        <button className="shuffle-btn shuffle-action-btn pulse-animation" onClick={handleShuffle} disabled={loading}>
                            {loading ? 'RE-SEEDING...' : 'FORCE QUESTION SHUFFLE'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShuffleQuestion;
