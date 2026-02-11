import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import Deadlock from "./pages/login";
import DeadlockLobby from "./pages/DeadlockLobby";
import CrackTheCode from "./pages/CrackTheCode";
import CrackCodeAdmin from "./pages/CrackCodeAdmin";
import DeadlockPage from './pages/DeadlockPage';
import DeadlockRedirect from './pages/DeadlockRedirect';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminPage />} />
        <Route path="/login" element={<Deadlock />} />
        <Route path="/crackTheCode" element={<CrackTheCode />} />
        <Route path="/deadlock/game" element={<DeadlockPage />} />
        <Route path="/deadlock" element={<DeadlockRedirect />} />
        {/* Guardrail: Redirect any other /deadlock/* paths to Home */}
        <Route path="/deadlock/*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Deadlock />} />
        <Route path="/admin/deadlock" element={<AdminPage />} />
        <Route path="/deadlock/lobby" element={<DeadlockLobby onMatchFound={(data) => console.log('Match data:', data)} />} />
        <Route path="/admin/crack-code" element={<CrackCodeAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
