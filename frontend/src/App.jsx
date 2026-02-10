import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import Deadlock from "./pages/login";
import DeadlockLobby from "./pages/DeadlockLobby";
import CrackTheCode from "./pages/CrackTheCode";
import CrackCodeAdmin from "./pages/CrackCodeAdmin";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Deadlock />} />
        <Route path="/admin/deadlock" element={<AdminPage />} />
        <Route path="/deadlock/lobby" element={<DeadlockLobby onMatchFound={(data) => console.log('Match data:', data)} />} />
        <Route path="/crackTheCode" element={<CrackTheCode />} />
        <Route path="/admin/crack-code" element={<CrackCodeAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
