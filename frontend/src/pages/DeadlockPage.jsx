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
    const [teamId, setTeamId] = useState(null); // Should be determined from context/auth

    // Submission State
    const CODE_TEMPLATES = {
        python: `# HOW TO READ INPUT:
# 1. Single line of values (e.g., "6 7")
#    a, b = map(int, input().split())
# 2. Distinct lines
#    a = int(input())
#    b = int(input())

# Write your code here
`,
        cpp: `// HOW TO READ INPUT (C++):
#include <iostream>
using namespace std;

int main() {
    // Example: Read two integers
    // int a, b;
    // cin >> a >> b;

    // Write your code here
    
    return 0;
}
`,
        java: `// HOW TO READ INPUT (Java):
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Example: Read two integers
        // if (sc.hasNextInt()) {
        //     int a = sc.nextInt();
        //     int b = sc.nextInt();
        // }

        // Write your code here
    }
}
`
    };

    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState(CODE_TEMPLATES.python);
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

            // Auto-determine team from localStorage
            const storedTeamId = localStorage.getItem('teamId');
            if (storedTeamId) {
                setTeamId(storedTeamId);
            }

            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load match");
            setLoading(false);
        }
    }, [matchId]);

    useEffect(() => {
        fetchMatchState();

        // Polling to keep tug position in sync
        const interval = setInterval(fetchMatchState, 5000);
        return () => clearInterval(interval);
    }, [fetchMatchState]);

    // Update code template when language changes
    useEffect(() => {
        // Only update if current code is an exact match for one of the other templates 
        // or is a solution-cleared message, to avoid overwriting user work accidentally.
        // For simplicity in a high-speed game, we'll just check if it's "mostly" a template.
        const otherLanguages = Object.keys(CODE_TEMPLATES).filter(l => l !== language);
        const isDefaultTemplate = otherLanguages.some(l => code === CODE_TEMPLATES[l]) || code === "// Question Solved! Loading next...";

        if (isDefaultTemplate) {
            setCode(CODE_TEMPLATES[language]);
        }
    }, [language]);

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
                        // Reset code to current language template
                        setCode(CODE_TEMPLATES[language]);
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
                    questionIndex={match?.currentQuestionIndex || 0}
                    totalQuestions={match?.totalQuestions || 0}
                />

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
