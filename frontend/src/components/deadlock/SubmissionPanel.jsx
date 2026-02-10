import React from 'react';

const SubmissionPanel = ({ onSubmit, isSubmitting }) => {
    return (
        <div className="submission-panel">
            <button
                className="submit-btn"
                onClick={onSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'DEPLOYING...' : 'DEPLOY SOLUTION'}
            </button>
        </div>
    );
};

export default SubmissionPanel;
