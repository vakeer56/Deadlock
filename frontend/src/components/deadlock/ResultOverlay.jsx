import React from 'react';

const ResultOverlay = React.memo(({ result, onClose }) => {
    React.useEffect(() => {
        if (result) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [result?.verdict, onClose]);

    if (!result) return null;

    return (
        <div className="result-overlay-backdrop" onClick={onClose}>
            <div className={`result-card verdict-${result.verdict} ${result.verdict === 'CONFLICT' ? 'result-card-warning' : ''}`} onClick={(e) => e.stopPropagation()}>
                {result.verdict === 'AC' && (
                    <div className="verdict-AC" data-text="ACCEPTED">ACCEPTED</div>
                )}
                {result.verdict === 'WRONG_ANSWER' && (
                    <div className="verdict-WA">WRONG ANSWER</div>
                )}
                {result.verdict === 'RUNTIME_ERROR' && (
                    <div className="verdict-RE">RUNTIME ERROR</div>
                )}
                {result.verdict === 'CONFLICT' && (
                    <div className="verdict-CONFLICT" data-text="TOO SLOW!">TOO SLOW!</div>
                )}
                {result.verdict === 'ERROR' && (
                    <div className="verdict-RE">ERROR</div>
                )}

                {result.error && (
                    <div style={{ color: '#aaa', marginTop: '1rem', whiteSpace: 'pre-wrap', textAlign: 'left', background: '#111', padding: '1rem', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                        {result.error}
                    </div>
                )}

                {result.verdict === 'CONFLICT' && (
                    <div style={{ color: '#e0e0e0', marginTop: '1rem' }}>
                        The question has changed. Reloading...
                    </div>
                )}
            </div>
        </div>
    );
});

export default ResultOverlay;
