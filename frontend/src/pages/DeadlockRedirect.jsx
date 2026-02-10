import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DeadlockRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const contextStr = localStorage.getItem('deadlockContext');
            if (contextStr) {
                const context = JSON.parse(contextStr);

                // 1. Valid context with matchId Logic
                if (context.matchId) {
                    navigate(`/deadlock/${context.matchId}`, { replace: true });
                    return;
                }
            }

            // 2. Dev Feedback: Log warning if context is missing/invalid
            if (process.env.NODE_ENV === 'development') {
                console.warn('[Deadlock] Invalid entry route — no matchId found in localStorage. Redirecting to home.');
            }

        } catch (e) {
            console.error("Failed to parse deadlock context", e);
            localStorage.removeItem('deadlockContext');
        }

        // 3. Fallback: Redirect to home safely
        navigate('/', { replace: true });
    }, [navigate]);

    return null; // Or a loading spinner
};

export default DeadlockRedirect;
