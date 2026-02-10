import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import CrackCodeLobby from './CrackCodeLobby';
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
    { input: "nums = [3,2,4], target = 6", output: "[0,1]", args: [[3, 2, 4], 6] },
    { input: "nums = [3,3], target = 6", output: "[0,1]", args: [[3, 3], 6] },
    { input: "nums = [2,5,5,11], target = 10", output: "[0,1]", args: [[2, 5, 5, 11], 10], hidden: true }
];

// --- Memoized Cinematic Components (Defined at top to avoid TDZ) ---

const HexagonGrid = React.memo(({ isFirst }) => {
    const hexagons = React.useMemo(() => Array.from({ length: 15 }).map(() => ({
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 50 + 20}px`,
        delay: `${Math.random() * 10}s`,
        duration: `${Math.random() * 5 + 7}s`,
    })), []);

    return (
        <div className="hexagon-grid">
            {hexagons.map((h, i) => (
                <svg key={i} className="hexagon" viewBox="0 0 100 100" style={{
                    position: 'absolute',
                    left: h.left,
                    width: h.width,
                    animationDelay: h.delay,
                    animationDuration: h.duration,
                    fill: 'none',
                    stroke: isFirst ? '#00ff41' : '#ff9d00',
                    strokeWidth: '1'
                }}>
                    <path d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" />
                </svg>
            ))}
        </div>
    );
});

const EmberField = React.memo(({ isFirst }) => {
    const embers = React.useMemo(() => Array.from({ length: 30 }).map(() => ({
        left: `${Math.random() * 100}%`,
        duration: `${Math.random() * 3 + 4}s`,
        delay: `${Math.random() * 5}s`,
        drift: `${(Math.random() - 0.5) * 200}px`,
        size: `${Math.random() * 3 + 2}px`,
    })), []);

    return (
        <div className="ember-field">
            {embers.map((e, i) => (
                <div
                    key={i}
                    className="ember"
                    style={{
                        left: e.left,
                        background: isFirst ? '#00ff41' : '#ff9d00',
                        filter: `blur(1px) drop-shadow(0 0 5px ${isFirst ? '#00ff41' : '#ff9d00'})`,
                        animationDuration: e.duration,
                        animationDelay: e.delay,
                        '--drift': e.drift,
                        width: e.size,
                        height: e.size
                    }}
                ></div>
            ))}
        </div>
    );
});

const DigitalRain = React.memo(({ isFirst }) => {
    const drops = React.useMemo(() => {
        const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()";
        return Array.from({ length: 20 }).map(() => ({
            duration: `${Math.random() * 2 + 1}s`,
            delay: `${Math.random() * 2}s`,
            content: Array.from({ length: 15 }).map(() => charset[Math.floor(Math.random() * charset.length)]).join('')
        }));
    }, []);

    return (
        <div className="digital-rain">
            {drops.map((d, i) => (
                <span
                    key={i}
                    className="rain-drop"
                    style={{
                        animationDuration: d.duration,
                        animationDelay: d.delay,
                        color: isFirst ? '#00ff41' : '#ff9d00'
                    }}
                >
                    {d.content}
                </span>
            ))}
        </div>
    );
});

const GameHeader = React.memo(({ initialTime, isGameStarted, submissionResult, onExpire }) => {
    const [secondsLeft, setSecondsLeft] = React.useState(initialTime);

    // Sync initialTime if it changes (e.g. on lobby transition)
    React.useEffect(() => {
        setSecondsLeft(initialTime);
    }, [initialTime]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    React.useEffect(() => {
        if (!isGameStarted || secondsLeft <= 0 || submissionResult) return;

        const timerId = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    onExpire();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [isGameStarted, submissionResult, onExpire]);

    return (
        <header className="main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{
                background: 'linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textTransform: 'uppercase',
                fontSize: '2rem',
                fontWeight: '800',
                margin: 0
            }}>Crack The Code</h1>
            <div className="timer" style={{
                fontSize: '1.5em',
                fontWeight: 'bold',
                marginRight: '20px',
                fontFamily: 'monospace'
            }}>
                <span style={{ color: 'aliceblue' }}>Time Left: </span>
                <span style={{ color: secondsLeft > 1200 ? '#28a745' : (secondsLeft > 300 ? '#e67300' : '#dc3545') }}>
                    {formatTime(secondsLeft)}
                </span>
            </div>
        </header>
    );
});

// --- Main Component ---

const CrackTheCode = () => {
    const [language, setLanguage] = useState('python');
    const [codeMap, setCodeMap] = useState(DEFAULT_CODE);
    const [activeTestCase, setActiveTestCase] = useState(0);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState({});
    const [hiddenTestResult, setHiddenTestResult] = useState(null);

    // --- Callback Stability Ref Pattern ---
    // This prevents high-frequency renders (keystrokes) from resetting the timer
    const handleSubmitRef = React.useRef();

    const handleLanguageChange = React.useCallback((e) => {
        setLanguage(e.target.value);
    }, []);

    const handleCodeChange = React.useCallback((value) => {
        setCodeMap((prev) => ({
            ...prev,
            [language]: value
        }));
    }, [language]);

    const handleEditorDidMount = React.useCallback((editor, monaco) => {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2016,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            lib: ["esnext", "dom"],
            typeRoots: ["node_modules/@types"]
        });

        monaco.languages.typescript.javascriptDefaults.addExtraLib(`
            declare var console: {
                log(...data: any[]): void;
                error(...data: any[]): void;
                warn(...data: any[]): void;
                info(...data: any[]): void;
            };
        `, 'ts:filename/console.d.ts');
    }, []);

    const executeTestCase = React.useCallback(async (testCase, lang, code) => {
        const teamId = localStorage.getItem("teamId");
        let codeToRun = code;
        let stdinData = "";

        if (lang === "python") {
            stdinData = JSON.stringify(testCase.args);
            codeToRun = `
import sys
import json
${code}

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
        } else if (lang === "javascript") {
            stdinData = JSON.stringify(testCase.args);
            codeToRun = `
${code}

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
        } else if (lang === "cpp") {
            const nums = testCase.args[0];
            const target = testCase.args[1];
            stdinData = `${nums.length} ${nums.join(' ')} ${target}`;

            codeToRun = `
${code}

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
        } else if (lang === "java") {
            const nums = testCase.args[0];
            const target = testCase.args[1];
            stdinData = `${nums.length} ${nums.join(' ')} ${target}`;

            const lines = code.split('\n');
            const imports = lines.filter(line => line.trim().startsWith('import ')).join('\n');
            const otherCode = lines.filter(line => !line.trim().startsWith('import ')).join('\n');

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
        if (lang === "java") {
            files[0].name = "Main.java";
        }

        const response = await fetch('http://localhost:5000/api/public/code/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teamId,
                language: lang === 'cpp' ? 'c++' : lang,
                version: LANGUAGE_VERSIONS[lang],
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

            return {
                log: log,
                result: result,
                isCorrect: actual === expected,
                status: "success"
            };
        } else {
            return { log: data.message, result: "Error", isCorrect: false, status: "error" };
        }
    }, []);

    const handleRun = React.useCallback(async () => {
        const teamId = localStorage.getItem("teamId");
        if (!teamId) {
            alert("Team ID not found. Please login again.");
            return;
        }

        setIsRunning(true);
        setTestResults({});
        setHiddenTestResult(null);

        let allVisiblePassedInProgress = true;

        for (let index = 0; index < TEST_CASES.length; index++) {
            const testCase = TEST_CASES[index];
            if (testCase.hidden) continue;

            try {
                const result = await executeTestCase(testCase, language, codeMap[language]);
                setTestResults(prev => ({ ...prev, [index]: result }));

                if (!result.isCorrect) {
                    allVisiblePassedInProgress = false;
                }
            } catch (error) {
                setTestResults(prev => ({
                    ...prev,
                    [index]: { log: "Network Error", result: error.message, isCorrect: false, status: "error" }
                }));
                allVisiblePassedInProgress = false;
            }
        }

        if (allVisiblePassedInProgress) {
            const hiddenTestCase = TEST_CASES.find(tc => tc.hidden);
            if (hiddenTestCase) {
                try {
                    const result = await executeTestCase(hiddenTestCase, language, codeMap[language]);
                    if (result.isCorrect) {
                        setHiddenTestResult("Hidden Test Case Passed!");
                    } else {
                        setHiddenTestResult("Hidden Test Case Failed");
                    }
                } catch (e) {
                    setHiddenTestResult("Hidden Test Case Error");
                }
            }
        } else {
            setHiddenTestResult(null);
        }

        setIsRunning(false);
    }, [language, codeMap, executeTestCase]);

    const handleSubmit = React.useCallback(async (isAutoSubmit = false) => {
        const teamId = localStorage.getItem("teamId");
        if (!teamId || !sessionId) {
            if (!isAutoSubmit) alert("Session information missing.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5000/api/public/crack-code/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId,
                    sessionId: sessionId,
                    submittedLogic: codeMap[language],
                    isCorrect: isAutoSubmit ? false : true
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setSubmissionResult({
                    isFirst: data.isFirst,
                    message: data.message
                });
            } else {
                if (!isAutoSubmit) alert(data.message || "Submission failed");
            }
        } catch (error) {
            console.error("Submission error:", error);
            if (!isAutoSubmit) alert("Network error during submission");
        } finally {
            setIsSubmitting(false);
        }
    }, [language, codeMap, sessionId]);

    // Keep the ref updated with the latest handleSubmit closure
    React.useEffect(() => {
        handleSubmitRef.current = handleSubmit;
    }, [handleSubmit]);

    // Fully stable handleExpire - reference NEVER changes
    const handleExpire = React.useCallback(() => {
        if (handleSubmitRef.current) {
            handleSubmitRef.current(true);
        }
    }, []);

    const allVisiblePassed = TEST_CASES.filter(tc => !tc.hidden).every((_, index) => testResults[index]?.isCorrect);
    const hiddenPassed = hiddenTestResult === "Hidden Test Case Passed!";
    const isSubmitEnabled = allVisiblePassed && hiddenPassed;

    if (!isGameStarted) {
        return <CrackCodeLobby onGameReady={(sessionData) => {
            if (sessionData && sessionData.startedAt) {
                const startTime = new Date(sessionData.startedAt).getTime();
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - startTime) / 1000);
                const totalDuration = 30 * 60;
                const remaining = Math.max(0, totalDuration - elapsedSeconds);
                setTimeLeft(remaining);
                setSessionId(sessionData.sessionId);
                if (sessionData.submission) {
                    setSubmissionResult(sessionData.submission);
                }
            }
            setIsGameStarted(true);
        }} />;
    }

    const isEnding = !!submissionResult;

    return (
        <div className={`crack-page ${isEnding ? 'ending' : ''}`}>
            <GameHeader
                initialTime={timeLeft}
                isGameStarted={isGameStarted}
                submissionResult={submissionResult}
                onExpire={handleExpire}
            />

            <div className="crack-container">
                {/* Left Panel Memoization Block */}
                <LeftPanel
                    activeTestCase={activeTestCase}
                    setActiveTestCase={setActiveTestCase}
                    testResults={testResults}
                    hiddenTestResult={hiddenTestResult}
                />

                {/* Right Panel - Uses stability patterns to prevent keystroke lag */}
                <RightPanel
                    language={language}
                    code={codeMap[language]}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    isSubmitEnabled={isSubmitEnabled}
                    activeTestCase={activeTestCase}
                    testResults={testResults}
                    handleLanguageChange={handleLanguageChange}
                    handleRun={handleRun}
                    handleSubmit={handleSubmit}
                    handleCodeChange={handleCodeChange}
                    handleEditorDidMount={handleEditorDidMount}
                />
            </div>

            {submissionResult && (
                <div className={`cyber-modal-overlay ${submissionResult.isFirst ? 'winner chromatic-pulse' : 'slower'}`}>
                    <div className="neon-scanner" style={{
                        background: `linear-gradient(90deg, transparent, ${submissionResult.isFirst ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 157, 0, 0.8)'}, transparent)`,
                        boxShadow: `0 0 20px ${submissionResult.isFirst ? 'rgba(0, 255, 65, 0.5)' : 'rgba(255, 157, 0, 0.5)'}`
                    }}></div>

                    <HexagonGrid isFirst={submissionResult.isFirst} />
                    <div className={`god-rays ${submissionResult.isFirst ? 'green' : 'amber'}`}></div>
                    <EmberField isFirst={submissionResult.isFirst} />
                    <div className="digital-noise"></div>
                    <DigitalRain isFirst={submissionResult.isFirst} />

                    <div className={`cyber-modal-content ${submissionResult.isFirst ? 'winner' : 'slower'}`}>
                        {submissionResult.isFirst && (
                            <>
                                <div className="cyber-crown-container">
                                    <svg className="cyber-crown-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 80L20 40L40 60L50 20L60 60L80 40L90 80H10Z" fill="#00ff41" fillOpacity="0.2" stroke="#00ff41" strokeWidth="2" />
                                        <circle cx="50" cy="20" r="3" fill="#00ff41" />
                                        <circle cx="20" cy="40" r="3" fill="#00ff41" />
                                        <circle cx="80" cy="40" r="3" fill="#00ff41" />
                                        <circle cx="10" cy="80" r="3" fill="#00ff41" />
                                        <circle cx="90" cy="80" r="3" fill="#00ff41" />
                                    </svg>
                                </div>
                                <div className="victory-shockwave">
                                    <div className="shock-ring shock-1"></div>
                                    <div className="shock-ring shock-2"></div>
                                    <div className="shock-ring shock-3"></div>
                                </div>
                            </>
                        )}
                        <div className="scanline"></div>
                        <div className="glitch-wrapper">
                            {submissionResult.isFirst && <div className="critical-status">// CRITICAL VICTORY //</div>}
                            <h2 className="cyber-title glitch" data-text={submissionResult.isFirst ? "SYSTEM OVERRIDE" : "BREACH DETECTED"}>
                                {submissionResult.isFirst ? "SYSTEM OVERRIDE" : "BREACH DETECTED"}
                            </h2>
                        </div>
                        <p className="cyber-message">
                            {submissionResult.message.split('\n').map((line, index) => (
                                <span key={index} className={index === 0 ? (submissionResult.isFirst ? "winner-highlight" : "participation-highlight") : ""}>
                                    {line}
                                    {index === 0 && <br />}
                                </span>
                            ))}
                        </p>
                        <div className="infinite-lock-text">
                            // SESSION PERSISTENCE ACTIVE //
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Memoized Panel Components ---

const LeftPanel = React.memo(({ activeTestCase, setActiveTestCase, testResults, hiddenTestResult }) => {
    return (
        <div className="panel left-panel">
            <div className="panel-header">
                <h2>Testcases</h2>
            </div>
            <div className="testcase-tabs">
                {TEST_CASES.filter(tc => !tc.hidden).map((_, index) => {
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
                                    {result.isCorrect ? '✔' : '✘'}
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

            {hiddenTestResult && (
                <div style={{
                    padding: '15px',
                    margin: '10px 20px',
                    background: hiddenTestResult.includes('Passed') ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                    border: `1px solid ${hiddenTestResult.includes('Passed') ? '#28a745' : '#dc3545'}`,
                    borderRadius: '8px',
                    color: hiddenTestResult.includes('Passed') ? '#28a745' : '#dc3545',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    {hiddenTestResult}
                </div>
            )}
        </div>
    );
});

const RightPanel = React.memo(({
    language, code, isRunning, isSubmitting, isSubmitEnabled,
    activeTestCase, testResults, handleLanguageChange, handleRun,
    handleSubmit, handleCodeChange, handleEditorDidMount
}) => {
    return (
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
                        onClick={() => handleSubmit()}
                        disabled={!isSubmitEnabled || isSubmitting}
                        title={!isSubmitEnabled ? "Pass all test cases (including hidden) to submit" : "Submit your code"}
                    >
                        {isSubmitting ? "Uploading..." : "Submit"}
                    </button>
                </div>
            </div>
            <div className="monaco-wrapper">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        quickSuggestions: { other: true, comments: true, strings: true },
                        parameterHints: { enabled: true },
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: "on",
                        tabCompletion: "on",
                        wordBasedSuggestions: true,
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
    );
});

export default CrackTheCode;
