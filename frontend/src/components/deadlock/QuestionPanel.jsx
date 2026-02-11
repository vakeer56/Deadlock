import React from 'react';

const QuestionPanel = ({ question, questionIndex, totalQuestions }) => {
    if (!question) {
        return <div className="question-panel">Loading Question...</div>;
    }

    return (
        <div className="question-panel">
            <div className="question-panel-content">
                <div className="question-meta cyber-technical-label">
                    QUESTION {questionIndex + 1} OF {totalQuestions}
                </div>
                <h1 className="question-title cyber-glitch-text">{question.title}</h1>
                <div className="question-desc">{question.description}</div>

                <div className="technical-brief">
                    <div className="brief-item">
                        <span className="label cyber-technical-label">INPUT_FORMAT:</span>
                        <span className="value">
                            {question.testCases?.[0]?.input.includes('\n') ? "MULTILINE" : "SPACE_SEPARATED"}
                        </span>
                    </div>
                </div>

                {question.testCases && question.testCases.length > 0 && (
                    <div className="examples-section">
                        <h3 className="cyber-technical-label">TARGET_SIGNAL (EXAMPLE)</h3>
                        <div className="example-box">
                            <div className="sig-in"><strong>INPUT:</strong> <code>{question.testCases[0].input}</code></div>
                            <div className="sig-out"><strong>OUTPUT:</strong> <code>{question.testCases[0].output}</code></div>
                        </div>
                    </div>
                )}

                <div className="operational-tips">
                    <h3 className="cyber-technical-label">DEPLOYMENT_TIPS</h3>
                    <ul className="tips-list">
                        <li>Ensure all inputs are cast to <code>int()</code> for mathematical operations.</li>
                        <li>For space-separated inputs, use <code>input().split()</code>.</li>
                        <li>Strings cannot be multiplied by strings.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default QuestionPanel;
