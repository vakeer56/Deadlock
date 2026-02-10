import React from 'react';

const DeadlockHeader = ({ teamA, teamB, status, winner }) => {
    return (
        <header className="deadlock-header">
            {/* Team A */}
            <div className={`team-badge team-a ${winner?._id === teamA?._id ? 'winner' : ''}`}>
                <span className="team-name">{teamA?.teamName || "Team A"}</span>
            </div>

            {/* Status */}
            <div className="match-status">
                {status === 'finished' ? (
                    <span className="status-finished">MATCH FINISHED</span>
                ) : (
                    <span className="status-live">LIVE MATCH</span>
                )}
            </div>

            {/* Team B */}
            <div className={`team-badge team-b ${winner?._id === teamB?._id ? 'winner' : ''}`}>
                <span className="team-name">{teamB?.teamName || "Team B"}</span>
            </div>
        </header>
    );
};

export default DeadlockHeader;
