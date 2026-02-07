import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './CrackTheCode.css';

const LANGUAGE_VERSIONS = {
    python: "3.10.0",
    cpp: "10.2.0",
    javascript: "18.15.0",
    java: "15.0.2"
};

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
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", args: [[2, 7, 11, 15], 9] },
    { input: "nums = [3,2,4], target = 6", output: "[1,2]", args: [[3, 2, 4], 6] },
    { input: "nums = [3,3], target = 6", output: "[0,1]", args: [[3, 3], 6] }
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

    const [consoleOutput, setConsoleOutput] = useState('');
    const [resultOutput, setResultOutput] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        const teamId = localStorage.getItem("teamId");
        if (!teamId) {
            alert("Team ID not found. Please login again.");
            return;
        }

        setIsRunning(true);
        setConsoleOutput('');
        setResultOutput('');
        setIsCorrect(null);

        try {
            let info = "";
            let codeToRun = codeMap[language];

            if (language === "python") {
                info = "\nprint(\"---SPLIT---\")\ntry:\n    print(solution())\nexcept Exception as e:\n    print(e)";
                codeToRun = codeMap[language] + info;
            } else if (language === "javascript") {
                info = "\nconsole.log(\"---SPLIT---\");\ntry {\n    console.log(solution());\n} catch (e) {\n    console.log(e);\n}";
                codeToRun = codeMap[language] + info;
            }
            // Add other languages wrapping here if needed

            const response = await fetch('http://localhost:5000/api/public/code/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamId,
                    language: language === 'cpp' ? 'c++' : language,
                    version: LANGUAGE_VERSIONS[language],
                    files: [
                        {
                            content: codeToRun,
                        }
                    ],
                    stdin: TEST_CASES[activeTestCase].input,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                const fullOutput = data.output || data.error || "";
                const parts = fullOutput.split("---SPLIT---");

                const consolePart = parts[0] || "";
                const resultPart = (parts[1] || "").trim();

                setConsoleOutput(consolePart);
                setResultOutput(resultPart);

                // Check against expected output
                const expected = TEST_CASES[activeTestCase].output.trim();

                // Simple string comparison for now. Ideally parse JSON for structured data.
                if (resultPart === expected) {
                    setIsCorrect(true);
                } else {
                    setIsCorrect(false);
                }
            } else {
                setConsoleOutput(`Error: ${data.message}\n${data.error || ''}`);
                setResultOutput("Error");
                setIsCorrect(false);
            }
        } catch (error) {
            setConsoleOutput(`Network Error: ${error.message}`);
            setResultOutput("Network Error");
        } finally {
            setIsRunning(false);
        }
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
                            <button className="btn run-btn" onClick={handleRun} disabled={isRunning}>
                                {isRunning ? (
                                    <div className="loading-container">
                                        <div className="loading-bar"></div>
                                    </div>
                                ) : 'Run'}
                            </button>
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

                    <div className="output-section" style={{ marginTop: '10px', height: '200px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                        <div className="console-box" style={{ flex: 1, backgroundColor: '#1e1e1e', color: '#fff', padding: '10px', overflowY: 'auto', border: '1px solid #333', fontFamily: 'monospace' }}>
                            <div style={{ color: '#888', marginBottom: '5px' }}>Console Output:</div>
                            <pre style={{ margin: 0 }}>{consoleOutput}</pre>
                        </div>
                        <div className="result-box" style={{
                            flex: 1,
                            backgroundColor: '#1e1e1e',
                            color: '#fff',
                            padding: '10px',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            border: isCorrect === null ? '1px solid #333' : (isCorrect ? '2px solid #28a745' : '2px solid #dc3545')
                        }}>
                            <div style={{ color: '#888', marginBottom: '5px' }}>Return Value:</div>
                            <pre style={{ margin: 0 }}>{resultOutput}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrackTheCode;
