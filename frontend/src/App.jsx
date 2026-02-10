import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import Deadlock from "./pages/login";
import CrackTheCode from "./pages/CrackTheCode";
import DeadlockPage from "./pages/DeadlockPage";
import DeadlockRedirect from "./pages/DeadlockRedirect";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminPage />} />
        <Route path="/login" element={<Deadlock />} />
        <Route path="/crackTheCode" element={<CrackTheCode />} />
        <Route path="/deadlock/:matchId" element={<DeadlockPage />} />
        <Route path="/deadlock" element={<DeadlockRedirect />} />
        {/* Guardrail: Redirect any other /deadlock/* paths to Home */}
        <Route path="/deadlock/*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
