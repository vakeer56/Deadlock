import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeadlockHeader from '../components/deadlock/DeadlockHeader';
import TugOfWarArena from '../components/deadlock/TugOfWarArena';
import QuestionPanel from '../components/deadlock/QuestionPanel';
import CodePanel from '../components/deadlock/CodePanel';
import SubmissionPanel from '../components/deadlock/SubmissionPanel';
import ResultOverlay from '../components/deadlock/ResultOverlay';
import '../components/deadlock/deadlock.css';

const DeadlockPage = () => {
    const  matchId  = JSON.parse(localStorage.getItem('deadlockContext')).matchId;
    const navigate = useNavigate();

    // Game State
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tugPosition, setTugPosition] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);

    // User State
    const [teamId, setTeamId] = useState(null); // Should be determined from context/auth

    // Submission State
    const [code, setCode] = useState("// Write your code here");
    const [language, setLanguage] = useState("python");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null); // { verdict, error }

    // Fetch Match State
    const fetchMatchState = useCallback(async () => {
        try {
            const res = await axios.get(`/api/public/deadlock/match/${matchId}`);
            const data = res.data;

            setMatch(data);
            setTugPosition(data.tugPosition);
            setCurrentQuestion(data.currentQuestion);

            // Auto-determine team if stored in localStorage (Dev convenience/Simple auth)
            // In a real app, this might come from a robust auth context
            const storedContext = JSON.parse(localStorage.getItem('deadlockContext') || '{}');
            if (storedContext.matchId === matchId) {
                setTeamId(storedContext.teamId);
            }

            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load match");
            setLoading(false);
        }
    }, [matchId]);

    // Initial Load & Polling (Optional, for now just load once)
    useEffect(() => {
        fetchMatchState();

        // Polling to keep tug position in sync? 
        // For now, let's rely on actions updating state, but a real game needs polling/sockets.
        // Adding a slow poll for sync
        const interval = setInterval(fetchMatchState, 5000);
        return () => clearInterval(interval);
    }, [fetchMatchState]);

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
                code
            };

            const res = await axios.post('/api/public/deadlock/submit', payload);

            if (res.status === 200) {
                const data = res.data;

                // Handle Success/Failure Verdicts
                if (data.success) {
                    setSubmissionResult({ verdict: "AC" });
                    setTugPosition(data.tugPosition);

                    // If match finished?
                    if (data.status === 'finished') {
                        setMatch(prev => ({ ...prev, status: 'finished' }));
                    } else {
                        // Prepare for next question? 
                        // The backend returns nextQuestionIndex, but we need the actual question object.
                        // Best to refetch to get the new question content.
                        fetchMatchState();
                        // Reset code? Maybe keep it or reset it.
                        setCode("// Question Solved! Loading next...");
                    }
                } else {
                    setSubmissionResult({
                        verdict: data.verdict,
                        error: data.error
                    });
                }
            }

        } catch (err) {
            // Handle 409 Conflict
            if (err.response && err.response.status === 409) {
                setSubmissionResult({ verdict: "CONFLICT", error: "The question has changed!" });
                fetchMatchState(); // Auto-sync
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

    return (
        <div className="deadlock-container">
            <DeadlockHeader
                teamA={match.teamA}
                teamB={match.teamB}
                status={match.status}
                winner={match.winner}
            />

            <TugOfWarArena
                tugPosition={tugPosition}
                maxPull={10} // Assuming 10 or deriving from match
            />

            <div className="game-lower-section">
                <QuestionPanel question={currentQuestion} />

                <div className="editor-section">
                    <CodePanel
                        code={code}
                        setCode={setCode}
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
                onClose={() => setSubmissionResult(null)}
            />
        </div>
    );
};

export default DeadlockPage;
