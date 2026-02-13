import React from 'react';

const QuestionPanel = ({ question, questionIndex, totalQuestions }) => {
    if (!question) {
        return <div className="question-panel">Loading Question...</div>;
    }

    return (
        <div className="question-panel">
            <div className="question-panel-content">
                <h1 className="question-title cyber-glitch-text">{question.title}</h1>
                <div className="question-desc">{question.description}</div>

                {question.testCases && question.testCases.filter(t => !t.isHidden).length > 0 && (
                    <div className="example-block-raw">
                        <div className="raw-in">INPUT: {question.testCases.find(t => !t.isHidden).input}</div>
                        <div className="raw-out">OUTPUT: {question.testCases.find(t => !t.isHidden).output}</div>
                    </div>
                )}

                <div className="operational-tips">
                    <h3 className="cyber-technical-label">DEPLOYMENT_TIPS</h3>
                    <ul className="tips-list">
                        <li>Implement the Solution class and the specified method.</li>
                        <li>Ensure your method returns the expected type (int, string, bool).</li>
                        <li>Return <code>true</code> or <code>false</code> as clear text for booleans.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default QuestionPanel;
