import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './CrackTheCode.css';

const DEFAULT_CODE = {
    python: `# Write your Python code here
def solution():
    print("Hello World")`,
    cpp: `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World";
    return 0;
}`,
    javascript: `// Write your JavaScript code here
console.log("Hello World");`,
    java: `// Write your Java code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`
};

const TEST_CASES = [
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
    { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    { input: "nums = [3,3], target = 6", output: "[0,1]" }
];

const CrackTheCode = () => {
    const [language, setLanguage] = useState('python');
    const [codeMap, setCodeMap] = useState(DEFAULT_CODE);
    const [activeTestCase, setActiveTestCase] = useState(0);

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleCodeChange = (value) => {
        setCodeMap((prev) => ({
            ...prev,
            [language]: value
        }));
    };

    const handleRun = () => {
        alert(`Running ${language} code...\n(Mock execution specific to frontend prototype)`);
        console.log("Running code:", codeMap[language]);
    };

    const handleSubmit = () => {
        alert(`Submitting ${language} code...`);
        console.log("Submitting code:", codeMap[language]);
    };

    return (
        <div className="crack-page">
            <header className="main-header">
                <h1>Reverse Engineering</h1>
            </header>

            <div className="crack-container">
                {/* Left Panel - Test Cases */}
                <div className="panel left-panel">
                    <div className="panel-header">
                        <h2>Testcase</h2>
                    </div>
                    <div className="testcase-tabs">
                        {TEST_CASES.map((_, index) => (
                            <button
                                key={index}
                                className={`tab-btn ${activeTestCase === index ? 'active' : ''}`}
                                onClick={() => setActiveTestCase(index)}
                            >
                                Case {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="testcase-content">
                        <div className="io-group">
                            <span className="label">Input =</span>
                            <div className="io-box">{TEST_CASES[activeTestCase].input}</div>
                        </div>
                        <div className="io-group">
                            <span className="label">Output =</span>
                            <div className="io-box">{TEST_CASES[activeTestCase].output}</div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Editor */}
                <div className="panel right-panel">
                    <div className="editor-header">
                        <div className="lang-selector">
                            <select value={language} onChange={handleLanguageChange}>
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                        <div className="actions">
                            <button className="btn run-btn" onClick={handleRun}>Run</button>
                            <button className="btn submit-btn" onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                    <div className="monaco-wrapper">
                        <Editor
                            height="100%"
                            language={language === 'cpp' ? 'cpp' : language}
                            theme="vs-dark"
                            value={codeMap[language]}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrackTheCode;
