
const TeamCard = ({ team, onDragStart, isDraggable = true }) => {
    return (
        <div
            draggable={isDraggable}
            onDragStart={(e) => onDragStart(e, team)}
            style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '1rem',
                margin: '0.5rem 0',
                cursor: isDraggable ? 'grab' : 'default',
                color: '#e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                transition: 'transform 0.2s, border-color 0.2s'
            }}
            className="team-card"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#FFCC00', fontSize: '1.2rem' }}>{team.name}</h3>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#888' }}>
                Members: {team.members ? team.members.join(', ') : 'No members'}
            </div>
        </div>
    );
};

export default TeamCard;
