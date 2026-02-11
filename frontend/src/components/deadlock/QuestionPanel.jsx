import React from 'react';

const QuestionPanel = ({ question }) => {
    if (!question) {
        return <div className="question-panel">Loading Question...</div>;
    }

    return (
        <div className="question-panel">
            <h1 className="question-title">{question.title}</h1>
            <div className="question-desc">{question.description}</div>


            {question.testCases && question.testCases.length > 0 && (
                <div className="examples-section">
                    <h3>Example</h3>
                    <div className="example-box">
                        <strong>Input:</strong> {question.testCases[0].input} <br />
                        <strong>Output:</strong> {question.testCases[0].output}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionPanel;
