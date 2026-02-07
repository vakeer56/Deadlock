import React, { useState, useEffect } from 'react';
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
def decodeLogic(nums, target):
    print("Processing...")
    return [0, 1]`,
    cpp: `// Write your C++ code here
#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> decodeLogic(vector<int>& nums, int target) {
        cout << "Processing..." << endl;
        return {0, 1};
    }
};`,
    javascript: `// Write your JavaScript code here
function decodeLogic(nums, target) {
    console.log("Processing...");
    return [0, 1];
}`,
    java: `// Write your Java code here
import java.util.*;

class Solution {
    public int[] decodeLogic(int[] nums, int target) {
        System.out.println("Processing...");
        return new int[]{0, 1};
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

    // Timer State
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    alert("Time is up!");
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const handleCodeChange = (value) => {
        setCodeMap((prev) => ({
            ...prev,
            [language]: value
        }));
    };

    const [testResults, setTestResults] = useState({}); // { 0: { log, result, isCorrect }, 1: ... }
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        const teamId = localStorage.getItem("teamId");
        if (!teamId) {
            alert("Team ID not found. Please login again.");
            return;
        }

        setIsRunning(true);
        setTestResults({});

        const newResults = {};

        // Use standard for loop for sequential execution
        for (let index = 0; index < TEST_CASES.length; index++) {
            const testCase = TEST_CASES[index];
            try {
                let codeToRun = codeMap[language];
                let stdinData = "";

                if (language === "python") {
                    stdinData = JSON.stringify(testCase.args);
                    codeToRun = `
import sys
import json
${codeMap[language]}

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        if input_data:
            args = json.loads(input_data)
            ret = decodeLogic(*args)
            print("\\n---RESULT---") 
            print(json.dumps(ret).replace(" ", "")) 
    except Exception as e:
        print(e)
`;
                } else if (language === "javascript") {
                    stdinData = JSON.stringify(testCase.args);
                    codeToRun = `
${codeMap[language]}

const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8');
    if (input) {
        const args = JSON.parse(input);
        const ret = decodeLogic(...args);
        console.log("\\n---RESULT---");
        if (ret !== undefined) {
             console.log(JSON.stringify(ret).replace(/\\s/g, ''));
        } else {
             console.log("undefined");
        }
    }
} catch(e) {
    console.log(e.toString());
}
`;
                } else if (language === "cpp") {
                    const nums = testCase.args[0];
                    const target = testCase.args[1];
                    stdinData = `${nums.length} ${nums.join(' ')} ${target}`;

                    codeToRun = `
${codeMap[language]}

int main() {
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; ++i) {
            cin >> nums[i];
        }
        int target;
        cin >> target;
        
        Solution s;
        vector<int> result = s.decodeLogic(nums, target);
        
        cout << "\\n---RESULT---" << endl;
        cout << "[";
        for (size_t i = 0; i < result.size(); ++i) {
            cout << result[i] << (i < result.size() - 1 ? "," : "");
        }
        cout << "]" << endl;
    }
    return 0;
}
`;
                } else if (language === "java") {
                    const nums = testCase.args[0];
                    const target = testCase.args[1];
                    stdinData = `${nums.length} ${nums.join(' ')} ${target}`;

                    // Parse user code to separate imports and class
                    const lines = codeMap[language].split('\n');
                    const imports = lines.filter(line => line.trim().startsWith('import ')).join('\n');
                    const otherCode = lines.filter(line => !line.trim().startsWith('import ')).join('\n');

                    // Construct code with Main class FIRST, then Solution class
                    codeToRun = `
${imports}
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int n = scanner.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) {
                nums[i] = scanner.nextInt();
            }
            int target = scanner.nextInt();
            
            Solution s = new Solution();
            int[] result = s.decodeLogic(nums, target);
            
            System.out.println("\\n---RESULT---");
            System.out.print("[");
            for (int i = 0; i < result.length; i++) {
                System.out.print(result[i] + (i < result.length - 1 ? "," : ""));
            }
            System.out.println("]");
        }
    }
}

${otherCode}
`;
                }

                const files = [{ content: codeToRun }];
                if (language === "java") {
                    files[0].name = "Main.java";
                }

                const response = await fetch('http://localhost:5000/api/public/code/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teamId,
                        language: language === 'cpp' ? 'c++' : language,
                        version: LANGUAGE_VERSIONS[language],
                        files: files,
                        stdin: stdinData,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    const fullOutput = data.output || data.error || "";
                    const splitMarker = "---RESULT---";
                    let log = fullOutput;
                    let result = "";

                    if (fullOutput.includes(splitMarker)) {
                        const parts = fullOutput.split(splitMarker);
                        log = parts[0].trim();
                        result = parts[1].trim();
                    }

                    const expected = testCase.output.replace(/\s/g, '');
                    const actual = result.replace(/\s/g, '');

                    newResults[index] = {
                        index,
                        log: log,
                        result: result,
                        isCorrect: actual === expected,
                        status: "success"
                    };
                } else {
                    newResults[index] = { index, log: data.message, result: "Error", isCorrect: false, status: "error" };
                }

            } catch (error) {
                newResults[index] = { index, log: "Network Error", result: error.message, isCorrect: false, status: "error" };
            }

            setTestResults(prev => ({ ...prev, [index]: newResults[index] }));
        }

        setIsRunning(false);
    };

    const handleSubmit = () => {
        alert(`Submitting ${language} code...`);
        console.log("Submitting code:", codeMap[language]);
    };

    const isSubmitEnabled = timeLeft <= 180; // Enabled only in last 3 mins (3 * 60)

    return (
        <div className="crack-page">
            <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{
                    background: 'linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'uppercase',
                    fontSize: '2rem',
                    fontWeight: '800',
                    margin: 0
                }}>Reverse Engineering</h1>
                <div className="timer" style={{
                    fontSize: '1.5em',
                    fontWeight: 'bold',
                    marginRight: '20px',
                    fontFamily: 'monospace'
                }}>
                    <span style={{ color: 'aliceblue' }}>Time Left: </span>
                    <span style={{ color: timeLeft > 1200 ? '#28a745' : (timeLeft > 300 ? '#e67300' : '#dc3545') }}>
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </header>

            <div className="crack-container">
                {/* Left Panel - Test Cases */}
                <div className="panel left-panel">
                    <div className="panel-header">
                        <h2>Testcases</h2>
                    </div>
                    <div className="testcase-tabs">
                        {TEST_CASES.map((_, index) => {
                            const result = testResults[index];
                            let statusClass = '';
                            if (result) {
                                statusClass = result.isCorrect ? 'success' : 'error';
                            }

                            return (
                                <button
                                    key={index}
                                    className={`tab-btn ${activeTestCase === index ? 'active' : ''} ${statusClass}`}
                                    onClick={() => setActiveTestCase(index)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    Case {index + 1}
                                    {result?.isCorrect !== undefined && (
                                        <span style={{
                                            color: result.isCorrect ? '#28a745' : '#dc3545',
                                            fontSize: '1.2em'
                                        }}>
                                            {result.isCorrect ? '●' : '●'}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
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
                            <button
                                className="btn submit-btn"
                                onClick={handleSubmit}
                                disabled={!isSubmitEnabled}
                                title={!isSubmitEnabled ? "Submit is enabled only in the last 3 minutes" : "Submit your code"}
                            >
                                Submit
                            </button>
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

                    <div className="output-section">
                        <div className="console-box">
                            <div style={{ color: '#aaa', marginBottom: '5px', fontSize: '0.85rem' }}>Console Output:</div>
                            <pre style={{ margin: 0, color: '#e0e0e0' }}>
                                {testResults[activeTestCase]?.log || "Run code to see output..."}
                            </pre>
                        </div>
                        <div className="result-box" style={{
                            border: testResults[activeTestCase]?.isCorrect === undefined
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : (testResults[activeTestCase]?.isCorrect ? '2px solid #28a745' : '2px solid #dc3545')
                        }}>
                            <div style={{ color: '#aaa', marginBottom: '5px', fontSize: '0.85rem' }}>Return Value:</div>
                            <pre style={{ margin: 0, color: '#e0e0e0' }}>
                                {testResults[activeTestCase]?.result || ""}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrackTheCode;
