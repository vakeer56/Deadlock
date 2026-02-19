import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import Deadlock from "./pages/login";
import DeadlockLobby from "./pages/DeadlockLobby";
import CrackTheCode from "./pages/CrackTheCode";
import CrackCodeAdmin from "./pages/CrackCodeAdmin";
import DeadlockPage from './pages/DeadlockPage';
import DeadlockRedirect from './pages/DeadlockRedirect';
import DeadlockTracker from './pages/DeadlockTracker';
import ShuffleQuestion from './pages/ShuffleQuestion';
import PromoteTeam from './pages/PromoteTeam';
import AdminSecurity from './pages/AdminSecurity';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedAdminRoute from './components/auth/ProtectedAdminRoute';
import AdminLogin from './pages/admin/AdminLogin';
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Authentication */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Zone */}
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminPage />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/admin/crack-code" element={<CrackCodeAdmin />} />
            <Route path="/admin/deadlock" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/deadlock-tracker" element={<DeadlockTracker />} />
            <Route path="/admin/deadlock/shuffle" element={<ShuffleQuestion />} />
            <Route path="/admin/deadlock/promote" element={<PromoteTeam />} />
          </Route>
        </Route>

        {/* Game Paths */}
        <Route path="/login" element={<Deadlock />} />
        <Route path="/crackTheCode" element={<CrackTheCode />} />
        <Route path="/deadlock/game" element={<DeadlockPage />} />
        <Route path="/deadlock" element={<DeadlockRedirect />} />
        {/* Guardrail: Redirect any other /deadlock/* paths to Home */}
        <Route path="/deadlock/*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Deadlock />} />

        <Route path="/deadlock/lobby" element={<DeadlockLobby onMatchFound={(data) => console.log('Match data:', data)} />} />


      </Routes>

    </Router>
  );
}

export default App;
