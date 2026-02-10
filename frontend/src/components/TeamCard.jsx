
const TeamCard = ({ team, onDragStart, onDrop, isDraggable = true }) => {
    return (
        <div
            draggable={isDraggable}
            onDragStart={(e) => onDragStart(e, team)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={`team-card ${isDraggable ? 'draggable' : ''}`}
        >
            <div className="card-header">
                <h3 className="team-name">{team.name}</h3>
                <span className="team-id">#ID-{team._id.slice(-4).toUpperCase()}</span>
            </div>
            <div className="members-section">
                <div className="section-title">OPERATIVES</div>
                <div className="members-list">
                    {team.members && team.members.length > 0 ? (
                        team.members.map((member, idx) => (
                            <div key={idx} className="member-name">
                                <span className="member-prefix">0{idx + 1}</span>
                                {member}
                            </div>
                        ))
                    ) : (
                        <div className="no-members">NO DATA FOUND</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamCard;
