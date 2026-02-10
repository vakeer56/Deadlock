import React from 'react';

const Rope = ({ offsetPercentage }) => {
    return (
        <div
            className="rope-container"
            style={{
                transform: `translate(calc(-50% + ${offsetPercentage}%), -50%)`
            }}
        >
            <div className="rope-line"></div>
            <div className="rope-marker"></div>
        </div>
    );
};

export default Rope;
