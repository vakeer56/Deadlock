import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeadlockHeader from '../components/deadlock/DeadlockHeader';
import TugOfWarArena from '../components/deadlock/TugOfWarArena';
import QuestionPanel from '../components/deadlock/QuestionPanel';
import CodePanel from '../components/deadlock/CodePanel';
import SubmissionPanel from '../components/deadlock/SubmissionPanel';
import ResultOverlay from '../components/deadlock/ResultOverlay';
import WinnerBackground from '../components/deadlock/WinnerBackground';
import LoserBackground from '../components/deadlock/LoserBackground';
import '../components/deadlock/deadlock.css';

const DeadlockPage = () => {
    const context = JSON.parse(localStorage.getItem('deadlockContext') || '{}');
    const matchId = context.matchId;
    const navigate = useNavigate();

    // Game State
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tugPosition, setTugPosition] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);

    // User State
    const [teamId, setTeamId] = useState(null);

    // Submission State
    const getBoilerplate = (lang, inputCount = 2) => {
        const inputsPy = inputCount > 1
            ? `a, b = map(int, input().split()) # Update this for ${inputCount} inputs`
            : `n = int(input())`;

        const inputsCpp = inputCount > 1
            ? `    int a, b; // Update for ${inputCount} inputs\n    cin >> a >> b;`
            : `    int n;\n    cin >> n;`;

        const inputsJava = inputCount > 1
            ? `        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt(); // Update for ${inputCount} inputs\n        }`
            : `        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n        }`;

        const templates = {
            python: `# HOW TO READ INPUT:\n${inputsPy}\n\n# Write your code here\n`,
            cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n${inputsCpp}\n\n    // Write your code here\n\n    return 0;\n}\n`,
            java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n${inputsJava}\n\n        // Write your code here\n    }\n}\n`
        };
        return templates[lang] || "";
    };

    const [language, setLanguage] = useState("python");
    const [codes, setCodes] = useState({
        python: getBoilerplate("python"),
        cpp: getBoilerplate("cpp"),
        java: getBoilerplate("java")
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const lastQuestionIndex = React.useRef(-1);
    const isFetching = React.useRef(false);
    const isSubmittingRef = React.useRef(false);
    const submissionResultRef = React.useRef(null);

    // Sync refs with state
    useEffect(() => {
        isSubmittingRef.current = isSubmitting;
    }, [isSubmitting]);

    useEffect(() => {
        submissionResultRef.current = submissionResult;
    }, [submissionResult]);

    const handleCloseOverlay = useCallback(() => {
        setSubmissionResult(null);
    }, []);

    const fetchMatchState = useCallback(async () => {
        if (isFetching.current || isSubmittingRef.current) return;
        isFetching.current = true;
        try {
            const res = await axios.get(`/api/public/deadlock/match/${matchId}`);
            const data = res.data;

            // Detect if question advanced (opponent solved it)
            if (lastQuestionIndex.current !== -1 && data.currentQuestionIndex > lastQuestionIndex.current) {
                // If we aren't currently submitting AND we don't already have a local AC being displayed, show "Too Slow!"
                if (!isSubmittingRef.current && submissionResultRef.current?.verdict !== "AC") {
                    setSubmissionResult({ verdict: "CONFLICT", error: "Opponent solved it first!" });
                }
            }
            lastQuestionIndex.current = data.currentQuestionIndex;

            // Optional: Only set state if something actually changed to avoid heavy re-renders
            setMatch(prev => {
                if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
                return data;
            });
            setTugPosition(data.tugPosition);
            setCurrentQuestion(prev => {
                if (prev?._id === data.currentQuestion?._id) return prev;
                return data.currentQuestion;
            });

            const storedTeamId = localStorage.getItem('teamId');
            if (storedTeamId) {
                setTeamId(storedTeamId);
            }

            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load match");
            setLoading(false);
        } finally {
            isFetching.current = false;
        }
    }, [matchId]);

    useEffect(() => {
        if (match?.status === 'finished') return;

        fetchMatchState();
        const interval = setInterval(fetchMatchState, 500);
        return () => clearInterval(interval);
    }, [fetchMatchState, match?.status]);

    useEffect(() => {
        if (!currentQuestion) return;
        const firstInput = currentQuestion.testCases?.[0]?.input || "";
        const inputLines = firstInput.trim().split('\n');
        const inputCount = inputLines.length > 1
            ? inputLines.length
            : firstInput.trim().split(/\s+/).length;

        setCodes({
            python: getBoilerplate("python", inputCount),
            cpp: getBoilerplate("cpp", inputCount),
            java: getBoilerplate("java", inputCount)
        });
    }, [currentQuestion?._id]);

    const handleCodeSubmit = async () => {
        if (!teamId) {
            alert("No team identified. Please join properly.");
            return;
        }

        setIsSubmitting(true);
        setSubmissionResult(null);

        try {
            const payload = {
                matchId,
                teamId,
                questionId: currentQuestion._id,
                language,
                code: codes[language]
            };

            const res = await axios.post('/api/public/deadlock/submit', payload);

            if (res.status === 200) {
                const data = res.data;
                if (data.success) {
                    setSubmissionResult({ verdict: "AC" });
                    setTugPosition(data.tugPosition);
                    // Update ref immediately to prevent poller race condition
                    lastQuestionIndex.current = data.nextQuestionIndex;

                    if (data.status === 'finished') {
                        setMatch(prev => ({
                            ...prev,
                            status: 'finished',
                            winner: data.winner,
                            loser: data.loser,
                            scoreA: data.scoreA,
                            scoreB: data.scoreB,
                            tugPosition: data.tugPosition
                        }));
                    } else {
                        fetchMatchState();
                    }
                } else {
                    setSubmissionResult({
                        verdict: data.verdict,
                        error: data.error
                    });
                }
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setSubmissionResult({ verdict: "CONFLICT", error: "The question has changed!" });
                fetchMatchState();
            } else {
                setSubmissionResult({ verdict: "ERROR", error: "Submission failed" });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-screen">Loading Match...</div>;
    if (error) return <div className="error-screen">{error}</div>;
    if (!match) return null;

    if (match.status === 'finished') {
        return <ResultView match={match} teamId={teamId} userTeam={localStorage.getItem('team')} />;
    }

    return (
        <div className="deadlock-container">
            <div className="cyber-grid-bg"></div>
            <DeadlockHeader
                teamA={match.teamA}
                teamB={match.teamB}
                status={match.status}
                winner={match.winner}
                userTeam={localStorage.getItem('team')}
                scoreA={match.scoreA}
                scoreB={match.scoreB}
            />

            <TugOfWarArena
                tugPosition={tugPosition}
                maxPull={match.maxPull || 5}
            />

            <div className="game-lower-section">
                <QuestionPanel
                    question={currentQuestion}
                />

                <div className="editor-section">
                    <CodePanel
                        code={codes[language]}
                        setCode={(newCode) => setCodes(prev => ({ ...prev, [language]: newCode }))}
                        language={language}
                        setLanguage={setLanguage}
                        isLocked={match.status === 'finished' || isSubmitting}
                    />
                    <SubmissionPanel
                        onSubmit={handleCodeSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>

            <ResultOverlay
                result={submissionResult}
                onClose={handleCloseOverlay}
            />
        </div>
    );
};

const ResultView = ({ match, teamId, userTeam }) => {
    const getTeamId = (team) => team?._id || team;
    const winnerId = getTeamId(match.winner);

    // Check winner against both string ID and team side (A/B)
    const isWinner = (winnerId && teamId && winnerId === teamId) ||
        (userTeam === 'A' && winnerId === getTeamId(match.teamA)) ||
        (userTeam === 'B' && winnerId === getTeamId(match.teamB));

    const teamName = localStorage.getItem('teamName') || (userTeam === 'A' ? "ALPHA" : "OMEGA");

    if (isWinner) {
        return (
            <div className="v2-emergency-fix winner-view">
                <WinnerBackground />
                <div className="cyber-grid-bg"></div>
                <div className="winner-container">
                    <div className="victory-crown">👑</div>
                    <h1 className="result-title winner-text title-v2">
                        MISSION ACCOMPLISHED
                    </h1>
                    <p className="result-subtitle">CONGRATULATIONS, TEAM {teamName}. THE CORE IS SECURED.</p>

                    <div className="mission-details table-v2">
                        <div className="detail-line">
                            <span className="detail-label">PROTOCOL:</span>
                            <span className="detail-value" style={{ color: '#00ff41' }}>DOMINATION_SUCCESS</span>
                        </div>
                        <div className="detail-line">
                            <span className="detail-label">ALPHA_SCORE:</span>
                            <span className="detail-value">{match.scoreA}</span>
                        </div>
                        <div className="detail-line">
                            <span className="detail-label">OMEGA_SCORE:</span>
                            <span className="detail-value">{match.scoreB}</span>
                        </div>
                    </div>

                    <div className="button-v2">
                        <a href="/crackTheCode" className="cyber-btn winner-btn">
                            CONTINUE TO DECRYPTION
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="v2-emergency-fix loser-view">
            <LoserBackground />
            <div className="cyber-grid-bg"></div>
            <div className="loser-container">
                <h1 className="result-title loser-text title-v2">
                    CONNECTION SEVERED
                </h1>
                <p className="result-subtitle">THANK YOU FOR YOUR SERVICE, {teamName}.</p>

                <div className="mission-details red-details">
                    <div className="detail-line">
                        <span className="detail-label">STATUS:</span>
                        <span className="detail-value" style={{ color: '#ff4757' }}>ACCESS_REVOKED</span>
                    </div>
                    <div className="detail-line">
                        <span className="detail-label">FINAL_STRENGTH:</span>
                        <span className="detail-value">{userTeam === 'A' ? match.scoreA : match.scoreB}</span>
                    </div>
                </div>

                <div className="revoked-msg">
                    <p>Terminal session has been terminated by the central core.</p>
                </div>

                <div className="button-v2">
                    <a href="/crackTheCode" className="cyber-btn participation-btn">
                        END GAME SESSION
                    </a>
                </div>
            </div>
        </div>
    );
};

export default DeadlockPage;
